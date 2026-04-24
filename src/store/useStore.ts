import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Cliente, Coluna, TipoObjecao } from '../types'
import { sampleData } from '../data/sampleData'
import { nowISO } from '../utils'

interface PendingMove {
  clienteId: string
  colunaDestino: Coluna
}

interface Store {
  clientes: Cliente[]
  modalCriar: boolean
  modalEditar: Cliente | null
  pendingMove: PendingMove | null

  addCliente: (data: Omit<Cliente, 'id' | 'criadoEm' | 'ultimaInteracao' | 'historico'>) => void
  updateCliente: (id: string, data: Partial<Cliente>) => void
  moveCliente: (id: string, coluna: Coluna, tipoObjecao?: TipoObjecao, observacaoObjecao?: string) => void
  deleteCliente: (id: string) => void

  setModalCriar: (open: boolean) => void
  setModalEditar: (cliente: Cliente | null) => void
  setPendingMove: (move: PendingMove | null) => void
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      clientes: sampleData,
      modalCriar: false,
      modalEditar: null,
      pendingMove: null,

      addCliente: (data) => {
        const now = nowISO()
        const cliente: Cliente = {
          ...data,
          id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          criadoEm: now,
          ultimaInteracao: now,
          historico: [{ data: now, texto: `Cliente cadastrado — origem: ${data.origem}` }],
        }
        set((s) => ({ clientes: [cliente, ...s.clientes] }))
      },

      updateCliente: (id, data) => {
        const now = nowISO()
        set((s) => ({
          clientes: s.clientes.map((c) =>
            c.id === id
              ? {
                  ...c,
                  ...data,
                  ultimaInteracao: now,
                  historico: [...c.historico, { data: now, texto: 'Dados atualizados' }],
                }
              : c
          ),
        }))
      },

      moveCliente: (id, coluna, tipoObjecao, observacaoObjecao) => {
        const now = nowISO()
        const COLUNA_LABELS: Record<Coluna, string> = {
          lead: 'Lead', qualificacao: 'Qualificação', orcamento: 'Orçamento Enviado',
          negociacao: 'Negociação', objecao: 'Objeção', aguardando: 'Aguardando',
          perdido: 'Perdido', vendido: 'Vendido',
        }
        set((s) => ({
          clientes: s.clientes.map((c) => {
            if (c.id !== id) return c
            return {
              ...c,
              coluna,
              ultimaInteracao: now,
              ...(tipoObjecao ? { tipoObjecao, observacaoObjecao } : {}),
              historico: [...c.historico, { data: now, texto: `Movido para: ${COLUNA_LABELS[coluna]}` }],
            }
          }),
          pendingMove: null,
        }))
      },

      deleteCliente: (id) =>
        set((s) => ({ clientes: s.clientes.filter((c) => c.id !== id) })),

      setModalCriar: (open) => set({ modalCriar: open }),
      setModalEditar: (cliente) => set({ modalEditar: cliente }),
      setPendingMove: (move) => set({ pendingMove: move }),
    }),
    {
      name: 'kaue-crm',
      version: 3,
      migrate: () => ({ clientes: sampleData, modalCriar: false, modalEditar: null, pendingMove: null }),
    }
  )
)
