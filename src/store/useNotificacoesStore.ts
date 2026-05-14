import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface Notificacao {
  id: string
  tipo: 'card_vencendo' | 'card_vencido' | 'aguardando_pagamento' | 'sistema'
  titulo: string
  mensagem?: string
  orcamentoId?: string
  lida: boolean
  criadaEm: string
}

interface NotificacoesStore {
  notificacoes: Notificacao[]
  naoLidas: number
  loadAll: () => Promise<void>
  marcarComoLida: (id: string) => Promise<void>
  marcarTodasComoLidas: () => Promise<void>
  subscribeRealtime: () => () => void
}

function rowToNotificacao(row: Record<string, unknown>): Notificacao {
  return {
    id: row.id as string,
    tipo: row.tipo as Notificacao['tipo'],
    titulo: row.titulo as string,
    mensagem: row.mensagem as string | undefined,
    orcamentoId: row.orcamento_id as string | undefined,
    lida: row.lida as boolean,
    criadaEm: row.criada_em as string,
  }
}

export const useNotificacoesStore = create<NotificacoesStore>((set, get) => ({
  notificacoes: [],
  naoLidas: 0,

  loadAll: async () => {
    const { data, error } = await supabase
      .from('notificacoes')
      .select('*')
      .order('criada_em', { ascending: false })
      .limit(50)
    if (error) { console.error('Erro ao carregar notificações:', error); return }
    const notificacoes = (data as Record<string, unknown>[]).map(rowToNotificacao)
    set({ notificacoes, naoLidas: notificacoes.filter((n) => !n.lida).length })
  },

  marcarComoLida: async (id) => {
    const { error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('id', id)
    if (error) return
    set((s) => {
      const notificacoes = s.notificacoes.map((n) => n.id === id ? { ...n, lida: true } : n)
      return { notificacoes, naoLidas: notificacoes.filter((n) => !n.lida).length }
    })
  },

  marcarTodasComoLidas: async () => {
    const ids = get().notificacoes.filter((n) => !n.lida).map((n) => n.id)
    if (!ids.length) return
    const { error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .in('id', ids)
    if (error) return
    set((s) => ({
      notificacoes: s.notificacoes.map((n) => ({ ...n, lida: true })),
      naoLidas: 0,
    }))
  },

  subscribeRealtime: () => {
    const channel = supabase
      .channel('notificacoes-rt')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notificacoes' },
        (payload) => {
          const nova = rowToNotificacao(payload.new as Record<string, unknown>)
          set((s) => ({
            notificacoes: [nova, ...s.notificacoes].slice(0, 50),
            naoLidas: s.naoLidas + 1,
          }))
          try {
            const audio = new Audio('/notification.mp3')
            audio.volume = 0.4
            audio.play().catch(() => { /* silencioso se arquivo não existir */ })
          } catch { /* ignorar */ }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  },
}))
