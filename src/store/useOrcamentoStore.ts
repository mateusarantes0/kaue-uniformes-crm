import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Orcamento, Coluna, TipoObjecao, COLUNA_LABELS } from '../types'
import { nowISO } from '../utils'
import { useAuthStore } from './useAuthStore'
import { sampleOrcamentos } from '../data/sampleData'

export interface PendingMove {
  orcamentoId: string
  colunaDestino: Coluna
  motivo: 'objecao' | 'perdido'
}

function computeFiltered(orcamentos: Orcamento[]): Orcamento[] {
  const { user } = useAuthStore.getState()
  if (!user || user.role === 'admin') return orcamentos
  return orcamentos.filter((c) => (c.ownerId ?? 'admin') === user.id)
}

function nextId(orcamentos: Orcamento[]): string {
  const nums = orcamentos
    .map((o) => parseInt(o.id.replace('ORC-', ''), 10))
    .filter((n) => !isNaN(n))
  const max = nums.length > 0 ? Math.max(...nums) : 0
  return `ORC-${String(max + 1).padStart(4, '0')}`
}

type AddData = Omit<Orcamento, 'id' | 'criadoEm' | 'atualizadoEm' | 'historico' | 'itensAcao' | 'ownerId' | 'criadoPor' | 'atualizadoPor'>

interface OrcamentoStore {
  orcamentos: Orcamento[]
  orcamentosFiltrados: Orcamento[]
  modalCriar: boolean
  modalEditar: Orcamento | null
  modalDetalheId: string | null
  pendingMove: PendingMove | null

  addOrcamento: (data: AddData) => void
  updateOrcamento: (id: string, data: Partial<Orcamento>) => void
  moveOrcamento: (id: string, coluna: Coluna, tipoObjecao?: TipoObjecao, observacaoObjecao?: string) => void
  deleteOrcamento: (id: string) => void
  marcarComoGanha: (id: string) => void
  marcarComoPerdida: (id: string, tipoObjecao: TipoObjecao, observacao?: string) => void
  addItemAcao: (orcamentoId: string, texto: string) => void
  toggleItemAcao: (orcamentoId: string, itemId: string) => void
  deleteItemAcao: (orcamentoId: string, itemId: string) => void
  removePessoaFromAll: (pessoaId: string) => void
  removeEmpresaFromAll: (empresaId: string) => void
  refreshFiltrados: () => void

  setModalCriar: (open: boolean) => void
  setModalEditar: (o: Orcamento | null) => void
  setModalDetalheId: (id: string | null) => void
  setPendingMove: (move: PendingMove | null) => void
}

export const useOrcamentoStore = create<OrcamentoStore>()(
  persist(
    (set) => ({
      orcamentos: sampleOrcamentos,
      orcamentosFiltrados: sampleOrcamentos,
      modalCriar: false,
      modalEditar: null,
      modalDetalheId: null,
      pendingMove: null,

      addOrcamento: (data) => {
        set((s) => {
          const now = nowISO()
          const userId = useAuthStore.getState().user?.id ?? 'admin'
          const orcamento: Orcamento = {
            ...data,
            id: nextId(s.orcamentos),
            criadoEm: now,
            atualizadoEm: now,
            criadoPor: userId,
            atualizadoPor: userId,
            ownerId: userId,
            campanhasOfertadas: data.campanhasOfertadas ?? [],
            contatosIds: data.contatosIds ?? [],
            historico: [{ data: now, texto: 'Orçamento criado', usuarioId: userId }],
            itensAcao: [],
          }
          const orcamentos = [orcamento, ...s.orcamentos]
          return { orcamentos, orcamentosFiltrados: computeFiltered(orcamentos) }
        })
      },

      updateOrcamento: (id, data) => {
        set((s) => {
          const now = nowISO()
          const userId = useAuthStore.getState().user?.id ?? 'admin'
          const orcamentos = s.orcamentos.map((o) =>
            o.id === id
              ? {
                  ...o,
                  ...data,
                  ultimoContatoEm: now,
                  atualizadoEm: now,
                  atualizadoPor: userId,
                  historico: [...o.historico, { data: now, texto: 'Dados atualizados', usuarioId: userId }],
                }
              : o
          )
          return { orcamentos, orcamentosFiltrados: computeFiltered(orcamentos) }
        })
      },

      moveOrcamento: (id, coluna, tipoObjecao, observacaoObjecao) => {
        set((s) => {
          const now = nowISO()
          const userId = useAuthStore.getState().user?.id ?? 'admin'
          const orcamentos = s.orcamentos.map((o) => {
            if (o.id !== id) return o
            return {
              ...o,
              coluna,
              ultimoContatoEm: now,
              atualizadoEm: now,
              atualizadoPor: userId,
              ...(tipoObjecao ? { tipoObjecao, observacaoObjecao } : {}),
              historico: [...o.historico, { data: now, texto: `Movido para: ${COLUNA_LABELS[coluna]}`, usuarioId: userId }],
            }
          })
          return { orcamentos, orcamentosFiltrados: computeFiltered(orcamentos), pendingMove: null }
        })
      },

      deleteOrcamento: (id) =>
        set((s) => {
          const orcamentos = s.orcamentos.filter((o) => o.id !== id)
          return { orcamentos, orcamentosFiltrados: computeFiltered(orcamentos) }
        }),

      marcarComoGanha: (id) => {
        set((s) => {
          const now = nowISO()
          const userId = useAuthStore.getState().user?.id ?? 'admin'
          const orcamentos = s.orcamentos.map((o) =>
            o.id === id
              ? {
                  ...o,
                  coluna: 'vendido' as Coluna,
                  vendidoEm: now,
                  ultimoContatoEm: now,
                  atualizadoEm: now,
                  atualizadoPor: userId,
                  historico: [...o.historico, { data: now, texto: '🏆 Marcado como Ganho', usuarioId: userId }],
                }
              : o
          )
          return { orcamentos, orcamentosFiltrados: computeFiltered(orcamentos) }
        })
      },

      marcarComoPerdida: (id, tipoObjecao, observacao) => {
        set((s) => {
          const now = nowISO()
          const userId = useAuthStore.getState().user?.id ?? 'admin'
          const orcamentos = s.orcamentos.map((o) =>
            o.id === id
              ? {
                  ...o,
                  coluna: 'perdido' as Coluna,
                  dataPerda: now,
                  tipoObjecao,
                  observacaoObjecao: observacao,
                  ultimoContatoEm: now,
                  atualizadoEm: now,
                  atualizadoPor: userId,
                  historico: [...o.historico, { data: now, texto: `😢 Marcado como Perdido — ${tipoObjecao}`, usuarioId: userId }],
                }
              : o
          )
          return { orcamentos, orcamentosFiltrados: computeFiltered(orcamentos), pendingMove: null }
        })
      },

      addItemAcao: (orcamentoId, texto) => {
        set((s) => {
          const now = nowISO()
          const item = {
            id: `ia_${Date.now()}`,
            texto,
            concluido: false,
            criadoEm: now,
          }
          const orcamentos = s.orcamentos.map((o) =>
            o.id === orcamentoId ? { ...o, itensAcao: [...o.itensAcao, item] } : o
          )
          return { orcamentos, orcamentosFiltrados: computeFiltered(orcamentos) }
        })
      },

      toggleItemAcao: (orcamentoId, itemId) => {
        set((s) => {
          const orcamentos = s.orcamentos.map((o) =>
            o.id === orcamentoId
              ? { ...o, itensAcao: o.itensAcao.map((i) => i.id === itemId ? { ...i, concluido: !i.concluido } : i) }
              : o
          )
          return { orcamentos, orcamentosFiltrados: computeFiltered(orcamentos) }
        })
      },

      deleteItemAcao: (orcamentoId, itemId) => {
        set((s) => {
          const orcamentos = s.orcamentos.map((o) =>
            o.id === orcamentoId ? { ...o, itensAcao: o.itensAcao.filter((i) => i.id !== itemId) } : o
          )
          return { orcamentos, orcamentosFiltrados: computeFiltered(orcamentos) }
        })
      },

      removePessoaFromAll: (pessoaId) => {
        set((s) => {
          const orcamentos = s.orcamentos.map((o) => ({
            ...o,
            contatosIds: o.contatosIds.filter((id) => id !== pessoaId),
          }))
          return { orcamentos, orcamentosFiltrados: computeFiltered(orcamentos) }
        })
      },

      removeEmpresaFromAll: (empresaId) => {
        set((s) => {
          const orcamentos = s.orcamentos.map((o) => ({
            ...o,
            empresaId: o.empresaId === empresaId ? undefined : o.empresaId,
          }))
          return { orcamentos, orcamentosFiltrados: computeFiltered(orcamentos) }
        })
      },

      refreshFiltrados: () =>
        set((s) => ({ orcamentosFiltrados: computeFiltered(s.orcamentos) })),

      setModalCriar: (open) => set({ modalCriar: open }),
      setModalEditar: (o) => set({ modalEditar: o }),
      setModalDetalheId: (id) => set({ modalDetalheId: id }),
      setPendingMove: (move) => set({ pendingMove: move }),
    }),
    {
      name: 'kaue-crm-orcamentos',
      version: 1,
      migrate: () => ({
        orcamentos: [],
        modalCriar: false,
        modalEditar: null,
        modalDetalheId: null,
        pendingMove: null,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.refreshFiltrados()
      },
      partialize: (s) => ({ orcamentos: s.orcamentos }),
    }
  )
)

useAuthStore.subscribe(() => {
  useOrcamentoStore.getState().refreshFiltrados()
})
