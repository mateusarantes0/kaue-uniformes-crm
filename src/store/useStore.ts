import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Cliente, Coluna, TipoObjecao } from '../types'
import { sampleData } from '../data/sampleData'
import { nowISO } from '../utils'
import { useAuthStore } from './useAuthStore'

interface PendingMove {
  clienteId: string
  colunaDestino: Coluna
}

function computeFiltered(clientes: Cliente[]): Cliente[] {
  const { user } = useAuthStore.getState()
  if (!user || user.role === 'admin') return clientes
  return clientes.filter((c) => (c.ownerId ?? 'admin') === user.id)
}

interface Store {
  clientes: Cliente[]
  clientesFiltrados: Cliente[]
  modalCriar: boolean
  modalEditar: Cliente | null
  pendingMove: PendingMove | null

  addCliente: (data: Omit<Cliente, 'id' | 'criadoEm' | 'ultimaInteracao' | 'historico' | 'ownerId'>) => void
  updateCliente: (id: string, data: Partial<Cliente>) => void
  moveCliente: (id: string, coluna: Coluna, tipoObjecao?: TipoObjecao, observacaoObjecao?: string) => void
  deleteCliente: (id: string) => void
  refreshFiltrados: () => void

  setModalCriar: (open: boolean) => void
  setModalEditar: (cliente: Cliente | null) => void
  setPendingMove: (move: PendingMove | null) => void
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      clientes: sampleData,
      clientesFiltrados: sampleData,
      modalCriar: false,
      modalEditar: null,
      pendingMove: null,

      addCliente: (data) => {
        const now = nowISO()
        const cliente: Cliente = {
          ...data,
          ownerId: useAuthStore.getState().user?.id ?? 'admin',
          id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          criadoEm: now,
          ultimaInteracao: now,
          historico: [{ data: now, texto: `Cliente cadastrado — origem: ${data.origem}` }],
        }
        set((s) => {
          const clientes = [cliente, ...s.clientes]
          return { clientes, clientesFiltrados: computeFiltered(clientes) }
        })
      },

      updateCliente: (id, data) => {
        const now = nowISO()
        set((s) => {
          const clientes = s.clientes.map((c) =>
            c.id === id
              ? {
                  ...c,
                  ...data,
                  ultimaInteracao: now,
                  historico: [...c.historico, { data: now, texto: 'Dados atualizados' }],
                }
              : c
          )
          return { clientes, clientesFiltrados: computeFiltered(clientes) }
        })
      },

      moveCliente: (id, coluna, tipoObjecao, observacaoObjecao) => {
        const now = nowISO()
        const COLUNA_LABELS: Record<Coluna, string> = {
          lead: 'Lead', qualificacao: 'Qualificação', orcamento: 'Orçamento Enviado',
          negociacao: 'Negociação', objecao: 'Objeção', aguardando: 'Aguardando',
          perdido: 'Perdido', vendido: 'Vendido',
        }
        set((s) => {
          const clientes = s.clientes.map((c) => {
            if (c.id !== id) return c
            return {
              ...c,
              coluna,
              ultimaInteracao: now,
              ...(tipoObjecao ? { tipoObjecao, observacaoObjecao } : {}),
              historico: [...c.historico, { data: now, texto: `Movido para: ${COLUNA_LABELS[coluna]}` }],
            }
          })
          return { clientes, clientesFiltrados: computeFiltered(clientes), pendingMove: null }
        })
      },

      deleteCliente: (id) =>
        set((s) => {
          const clientes = s.clientes.filter((c) => c.id !== id)
          return { clientes, clientesFiltrados: computeFiltered(clientes) }
        }),

      refreshFiltrados: () =>
        set((s) => ({ clientesFiltrados: computeFiltered(s.clientes) })),

      setModalCriar: (open) => set({ modalCriar: open }),
      setModalEditar: (cliente) => set({ modalEditar: cliente }),
      setPendingMove: (move) => set({ pendingMove: move }),
    }),
    {
      name: 'kaue-crm',
      version: 4,
      migrate: (persistedState: any, version: number) => {
        if (version === 3) {
          const clientes = (persistedState.clientes ?? []).map((c: any) => ({
            ...c,
            ownerId: c.ownerId ?? 'admin',
          }))
          return { ...persistedState, clientes }
        }
        return { clientes: sampleData, modalCriar: false, modalEditar: null, pendingMove: null }
      },
      onRehydrateStorage: () => (state) => {
        if (state) state.refreshFiltrados()
      },
      partialize: (s) => ({
        clientes: s.clientes,
        modalCriar: s.modalCriar,
        modalEditar: s.modalEditar,
        pendingMove: s.pendingMove,
      }),
    }
  )
)

// Mantém clientesFiltrados sincronizado quando o usuário faz login/logout
useAuthStore.subscribe(() => {
  useStore.getState().refreshFiltrados()
})
