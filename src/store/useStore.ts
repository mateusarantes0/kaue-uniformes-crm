import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Orcamento, Coluna, TipoObjecao, COLUNA_LABELS, Origem } from '../types'
import { sampleData } from '../data/sampleData'
import { nowISO } from '../utils'
import { useAuthStore } from './useAuthStore'

interface PendingMove {
  orcamentoId: string
  colunaDestino: Coluna
}

function computeFiltered(orcamentos: Orcamento[]): Orcamento[] {
  const { user } = useAuthStore.getState()
  if (!user || user.role === 'admin') return orcamentos
  return orcamentos.filter((c) => (c.ownerId ?? 'admin') === user.id)
}

interface Store {
  orcamentos: Orcamento[]
  orcamentosFiltrados: Orcamento[]
  modalCriar: boolean
  modalEditar: Orcamento | null
  pendingMove: PendingMove | null

  addOrcamento: (data: Omit<Orcamento, 'id' | 'criadoEm' | 'atualizadoEm' | 'historico' | 'ownerId' | 'criadoPor' | 'atualizadoPor'>) => void
  updateOrcamento: (id: string, data: Partial<Orcamento>) => void
  moveOrcamento: (id: string, coluna: Coluna, tipoObjecao?: TipoObjecao, observacaoObjecao?: string) => void
  deleteOrcamento: (id: string) => void
  refreshFiltrados: () => void

  setModalCriar: (open: boolean) => void
  setModalEditar: (orcamento: Orcamento | null) => void
  setPendingMove: (move: PendingMove | null) => void
}

function mapLegacyOrigem(o: string): Origem {
  const map: Record<string, string> = {
    loja:       'loja_fisica',
    prospeccao: 'prospeccao_ativa',
    instagram:  'instagram_organico',
    outros:     'indicacao',
  }
  return (map[o] ?? o) as Origem
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      orcamentos: sampleData,
      orcamentosFiltrados: sampleData,
      modalCriar: false,
      modalEditar: null,
      pendingMove: null,

      addOrcamento: (data) => {
        const now = nowISO()
        const userId = useAuthStore.getState().user?.id ?? 'admin'
        const orcamento: Orcamento = {
          ...data,
          ownerId: userId,
          id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          criadoEm: now,
          atualizadoEm: now,
          criadoPor: userId,
          atualizadoPor: userId,
          contatosIds: data.contatosIds ?? [],
          responsavelId: data.responsavelId ?? userId,
          historico: [{ data: now, texto: 'Orçamento cadastrado', usuarioId: userId }],
        }
        set((s) => {
          const orcamentos = [orcamento, ...s.orcamentos]
          return { orcamentos, orcamentosFiltrados: computeFiltered(orcamentos) }
        })
      },

      updateOrcamento: (id, data) => {
        const now = nowISO()
        const userId = useAuthStore.getState().user?.id ?? 'admin'
        set((s) => {
          const orcamentos = s.orcamentos.map((c) =>
            c.id === id
              ? {
                  ...c,
                  ...data,
                  ultimoContatoEm: now,
                  atualizadoEm: now,
                  atualizadoPor: userId,
                  historico: [...c.historico, { data: now, texto: 'Dados atualizados', usuarioId: userId }],
                }
              : c
          )
          return { orcamentos, orcamentosFiltrados: computeFiltered(orcamentos) }
        })
      },

      moveOrcamento: (id, coluna, tipoObjecao, observacaoObjecao) => {
        const now = nowISO()
        const userId = useAuthStore.getState().user?.id ?? 'admin'
        set((s) => {
          const orcamentos = s.orcamentos.map((c) => {
            if (c.id !== id) return c
            return {
              ...c,
              coluna,
              ultimoContatoEm: now,
              atualizadoEm: now,
              atualizadoPor: userId,
              ...(tipoObjecao ? { tipoObjecao, observacaoObjecao } : {}),
              ...(coluna === 'vendido' ? { vendidoEm: now } : {}),
              ...(coluna === 'perdido' ? { dataPerda: now } : {}),
              historico: [...c.historico, { data: now, texto: `Movido para: ${COLUNA_LABELS[coluna]}`, usuarioId: userId }],
            }
          })
          return { orcamentos, orcamentosFiltrados: computeFiltered(orcamentos), pendingMove: null }
        })
      },

      deleteOrcamento: (id) =>
        set((s) => {
          const orcamentos = s.orcamentos.filter((c) => c.id !== id)
          return { orcamentos, orcamentosFiltrados: computeFiltered(orcamentos) }
        }),

      refreshFiltrados: () =>
        set((s) => ({ orcamentosFiltrados: computeFiltered(s.orcamentos) })),

      setModalCriar: (open) => set({ modalCriar: open }),
      setModalEditar: (orcamento) => set({ modalEditar: orcamento }),
      setPendingMove: (move) => set({ pendingMove: move }),
    }),
    {
      name: 'kaue-crm',
      version: 5,
      migrate: (persistedState: any, version: number) => {
        if (version === 4) {
          const orcamentos = (persistedState.clientes ?? []).map((c: any) => ({
            id: c.id,
            ownerId: c.ownerId ?? 'admin',
            nome: c.nome,
            responsavelId: c.ownerId ?? 'admin',
            valor: c.valorEstimado,
            coluna: c.coluna === 'orcamento' ? 'orcamento_enviado' : c.coluna,
            origem: c.origem ? mapLegacyOrigem(c.origem) : undefined,
            contatosIds: [],
            orcamentoEnviadoEm: c.dataEnvioOrcamento,
            ultimoContatoEm: c.ultimaInteracao,
            tipoObjecao: c.tipoObjecao,
            observacaoObjecao: c.observacaoObjecao,
            historico: (c.historico ?? []).map((h: any) => ({
              ...h,
              usuarioId: c.ownerId ?? 'admin',
            })),
            criadoEm: c.criadoEm,
            criadoPor: c.ownerId ?? 'admin',
            atualizadoEm: c.ultimaInteracao ?? c.criadoEm,
            atualizadoPor: c.ownerId ?? 'admin',
          }))
          return { ...persistedState, clientes: undefined, orcamentos }
        }
        return { orcamentos: sampleData, modalCriar: false, modalEditar: null, pendingMove: null }
      },
      onRehydrateStorage: () => (state) => {
        if (state) state.refreshFiltrados()
      },
      partialize: (s) => ({
        orcamentos: s.orcamentos,
        modalCriar: s.modalCriar,
        modalEditar: s.modalEditar,
        pendingMove: s.pendingMove,
      }),
    }
  )
)

useAuthStore.subscribe(() => {
  useStore.getState().refreshFiltrados()
})
