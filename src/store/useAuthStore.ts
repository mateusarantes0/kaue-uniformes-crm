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

async function loadAllStores() {
  const [{ useEmpresaStore }, { usePessoaStore }, { useOrcamentoStore }] = await Promise.all([
    import('./useEmpresaStore'),
    import('./usePessoaStore'),
    import('./useOrcamentoStore'),
  ])
  await Promise.all([
    useEmpresaStore.getState().loadAll(),
    usePessoaStore.getState().loadAll(),
    useOrcamentoStore.getState().loadAll(),
  ])
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  users: [],
  loading: true,

  initialize: async () => {
    // onAuthStateChange is the authoritative source of session state.
    // It fires INITIAL_SESSION immediately on subscription — reliable on page refresh
    // even when the token needs to be silently refreshed (getSession can return null then).
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const [profile, allProfiles] = await Promise.all([
          fetchProfile(session.user.id),
          fetchAllProfiles(),
        ])
        if (profile) {
          set({ user: profile, users: allProfiles, loading: false })
          // Only (re)load data stores on actual sign-in events, not on silent token refreshes
          if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
            await loadAllStores()
          }
        } else {
          set({ user: null, users: [], loading: false })
        }
      } else {
        set({ user: null, users: [], loading: false })
      }
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
