import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface User {
  id: string
  username: string
  name: string
  role: 'admin' | 'employee'
}

interface AuthStore {
  user: User | null
  users: User[]
  loading: boolean

  initialize: () => Promise<void>
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ ok: boolean; error?: string }>
}

async function fetchProfile(userId: string): Promise<User | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id, username, name, role')
    .eq('id', userId)
    .single()
  return data ?? null
}

async function fetchAllProfiles(): Promise<User[]> {
  const { data } = await supabase.from('profiles').select('id, username, name, role')
  return (data ?? []) as User[]
}

async function loadStoresParallel() {
  const [{ useEmpresaStore }, { usePessoaStore }, { useOrcamentoStore }, { useNotificacoesStore }] = await Promise.all([
    import('./useEmpresaStore'),
    import('./usePessoaStore'),
    import('./useOrcamentoStore'),
    import('./useNotificacoesStore'),
  ])
  Promise.allSettled([
    useEmpresaStore.getState().loadAll(),
    usePessoaStore.getState().loadAll(),
    useOrcamentoStore.getState().loadAll(),
    useNotificacoesStore.getState().loadAll(),
  ]).then((results) => {
    results.forEach((r, i) => {
      if (r.status === 'rejected') console.error(`Store ${i} falhou ao carregar:`, r.reason)
    })
    // Inicia subscription de notificações em tempo real após carregar
    useNotificacoesStore.getState().subscribeRealtime()
  })
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  users: [],
  loading: true,

  initialize: async () => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error('Timeout ao inicializar sessão')),
          10000,
        )
      })

      const initPromise = (async () => {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        if (!session?.user) {
          set({ user: null, users: [], loading: false })
          return
        }

        const [profile, allProfiles] = await Promise.all([
          fetchProfile(session.user.id),
          fetchAllProfiles(),
        ])

        if (!profile) {
          await supabase.auth.signOut()
          set({ user: null, users: [], loading: false })
          return
        }

        set({ user: profile, users: allProfiles, loading: false })

        // Carrega stores em paralelo sem bloquear o loading da auth
        loadStoresParallel()
      })()

      await Promise.race([initPromise, timeoutPromise])
    } catch (err) {
      console.error('Erro ao inicializar:', err)
      try { await supabase.auth.signOut() } catch { /* ignorar */ }
      set({ user: null, users: [], loading: false })
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
    }

    // Listener para mudanças de auth após o carregamento inicial
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        // Ignorar re-autenticação do mesmo usuário (changePassword, token refresh)
        if (get().user?.id === session?.user?.id) return
        try {
          const [profile, allProfiles] = await Promise.all([
            fetchProfile(session!.user.id),
            fetchAllProfiles(),
          ])
          if (profile) {
            set({ user: profile, users: allProfiles })
            loadStoresParallel()
          }
        } catch (e) {
          console.error('Erro ao atualizar profile no listener:', e)
        }
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, users: [], loading: false })
      }
      // TOKEN_REFRESHED, USER_UPDATED, INITIAL_SESSION: ignorados intencionalmente
    })
  },

  login: async (username, password) => {
    const email = `${username}@kaueuniformes.com`
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: 'Usuário ou senha inválidos' }
    return { ok: true }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, users: [] })
  },

  changePassword: async (currentPassword, newPassword) => {
    const user = get().user
    if (!user) return { ok: false, error: 'Não autenticado' }

    const email = `${user.username}@kaueuniformes.com`
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    })
    if (signInError) return { ok: false, error: 'Senha atual incorreta' }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  },
}))
