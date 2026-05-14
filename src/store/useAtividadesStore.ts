import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './useAuthStore'
import { nowISO } from '../utils'

export interface Atividade {
  id: string
  orcamentoId: string
  userId: string
  titulo: string
  data: string
  hora?: string
  concluida: boolean
  concluidaEm?: string
  criadaEm: string
}

export interface ResumoAtividade {
  proximaData: string | null
  pendentes: number
}

interface AtividadesStore {
  porOrcamento: Record<string, Atividade[]>
  resumo: Record<string, ResumoAtividade>
  loadByOrcamento: (orcamentoId: string) => Promise<void>
  loadResumo: () => Promise<void>
  adicionar: (orcamentoId: string, titulo: string, data: string, hora?: string) => Promise<void>
  marcarConcluida: (id: string, orcamentoId: string) => Promise<void>
  remover: (id: string, orcamentoId: string) => Promise<void>
  subscribeGlobal: () => () => void
}

function rowToAtividade(row: Record<string, unknown>): Atividade {
  return {
    id: row.id as string,
    orcamentoId: row.orcamento_id as string,
    userId: row.user_id as string,
    titulo: row.titulo as string,
    data: row.data as string,
    hora: row.hora as string | undefined,
    concluida: row.concluida as boolean,
    concluidaEm: row.concluida_em as string | undefined,
    criadaEm: row.criada_em as string,
  }
}

export const useAtividadesStore = create<AtividadesStore>((set, get) => ({
  porOrcamento: {},
  resumo: {},

  loadByOrcamento: async (orcamentoId) => {
    const { data, error } = await supabase
      .from('atividades')
      .select('*')
      .eq('orcamento_id', orcamentoId)
      .order('data', { ascending: true })
    if (error) { console.error('Erro ao carregar atividades:', error); return }
    const atividades = (data as Record<string, unknown>[]).map(rowToAtividade)
    set((s) => ({ porOrcamento: { ...s.porOrcamento, [orcamentoId]: atividades } }))
  },

  loadResumo: async () => {
    const { data, error } = await supabase
      .from('orcamentos_proxima_atividade')
      .select('orcamento_id, proxima_data, pendentes')
    if (error) { /* view pode não existir ainda — silencioso */ return }
    const resumo: Record<string, ResumoAtividade> = {}
    for (const row of data ?? []) {
      resumo[row.orcamento_id] = {
        proximaData: row.proxima_data ?? null,
        pendentes: Number(row.pendentes ?? 0),
      }
    }
    set({ resumo })
  },

  adicionar: async (orcamentoId, titulo, data, hora) => {
    const userId = useAuthStore.getState().user?.id ?? ''
    const { data: rows, error } = await supabase
      .from('atividades')
      .insert({ orcamento_id: orcamentoId, user_id: userId, titulo, data, hora: hora || null })
      .select()
    if (error) { console.error('Erro ao adicionar atividade:', error); return }
    const nova = rowToAtividade(rows![0] as Record<string, unknown>)
    set((s) => ({
      porOrcamento: {
        ...s.porOrcamento,
        [orcamentoId]: [...(s.porOrcamento[orcamentoId] ?? []), nova].sort((a, b) => a.data.localeCompare(b.data)),
      },
    }))
    get().loadResumo()
  },

  marcarConcluida: async (id, orcamentoId) => {
    const ativ = (get().porOrcamento[orcamentoId] ?? []).find((a) => a.id === id)
    if (!ativ) return
    const concluida = !ativ.concluida
    const { error } = await supabase
      .from('atividades')
      .update({ concluida, concluida_em: concluida ? nowISO() : null })
      .eq('id', id)
    if (error) return
    set((s) => ({
      porOrcamento: {
        ...s.porOrcamento,
        [orcamentoId]: (s.porOrcamento[orcamentoId] ?? []).map((a) =>
          a.id === id ? { ...a, concluida, concluidaEm: concluida ? nowISO() : undefined } : a
        ),
      },
    }))
    get().loadResumo()
  },

  remover: async (id, orcamentoId) => {
    const { error } = await supabase.from('atividades').delete().eq('id', id)
    if (error) return
    set((s) => ({
      porOrcamento: {
        ...s.porOrcamento,
        [orcamentoId]: (s.porOrcamento[orcamentoId] ?? []).filter((a) => a.id !== id),
      },
    }))
    get().loadResumo()
  },

  subscribeGlobal: () => {
    const channel = supabase
      .channel('atividades-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'atividades' }, () => {
        useAtividadesStore.getState().loadResumo()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  },
}))
