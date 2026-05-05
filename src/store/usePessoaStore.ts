import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Pessoa } from '../types'
import { nowISO } from '../utils'
import { useAuthStore } from './useAuthStore'
import { samplePessoas } from '../data/sampleData'

function computeFiltered(pessoas: Pessoa[]): Pessoa[] {
  const { user } = useAuthStore.getState()
  if (!user || user.role === 'admin') return pessoas
  return pessoas.filter((p) => p.ownerId === user.id)
}

function nextId(pessoas: Pessoa[]): string {
  const nums = pessoas
    .map((p) => parseInt(p.id.replace('PES-', ''), 10))
    .filter((n) => !isNaN(n))
  const max = nums.length > 0 ? Math.max(...nums) : 0
  return `PES-${String(max + 1).padStart(4, '0')}`
}

type AddData = Omit<Pessoa, 'id' | 'criadoEm' | 'atualizadoEm' | 'ownerId' | 'criadoPor' | 'atualizadoPor'>

interface PessoaStore {
  pessoas: Pessoa[]
  pessoasFiltradas: Pessoa[]
  modalCriar: boolean
  modalEditar: Pessoa | null

  addPessoa: (data: AddData) => Pessoa
  updatePessoa: (id: string, data: Partial<Pessoa>) => void
  deletePessoa: (id: string) => void
  refreshFiltrados: () => void

  setModalCriar: (open: boolean) => void
  setModalEditar: (p: Pessoa | null) => void
}

export const usePessoaStore = create<PessoaStore>()(
  persist(
    (set, get) => ({
      pessoas: samplePessoas,
      pessoasFiltradas: samplePessoas,
      modalCriar: false,
      modalEditar: null,

      addPessoa: (data) => {
        const now = nowISO()
        const userId = useAuthStore.getState().user?.id ?? 'admin'
        const pessoa: Pessoa = {
          ...data,
          id: nextId(get().pessoas),
          criadoEm: now,
          atualizadoEm: now,
          criadoPor: userId,
          atualizadoPor: userId,
          ownerId: userId,
          responsaveisIds: data.responsaveisIds ?? [],
          empresasIds: data.empresasIds ?? [],
        }
        set((s) => {
          const pessoas = [...s.pessoas, pessoa]
          return { pessoas, pessoasFiltradas: computeFiltered(pessoas) }
        })
        return pessoa
      },

      updatePessoa: (id, data) => {
        set((s) => {
          const now = nowISO()
          const userId = useAuthStore.getState().user?.id ?? 'admin'
          const pessoas = s.pessoas.map((p) =>
            p.id === id ? { ...p, ...data, atualizadoEm: now, atualizadoPor: userId } : p
          )
          return { pessoas, pessoasFiltradas: computeFiltered(pessoas) }
        })
      },

      deletePessoa: (id) => {
        set((s) => {
          const pessoas = s.pessoas.filter((p) => p.id !== id)
          return { pessoas, pessoasFiltradas: computeFiltered(pessoas) }
        })
        // cascade: remove from all orcamentos
        import('./useOrcamentoStore').then(({ useOrcamentoStore }) => {
          useOrcamentoStore.getState().removePessoaFromAll(id)
        })
      },

      refreshFiltrados: () =>
        set((s) => ({ pessoasFiltradas: computeFiltered(s.pessoas) })),

      setModalCriar: (open) => set({ modalCriar: open }),
      setModalEditar: (p) => set({ modalEditar: p }),
    }),
    {
      name: 'kaue-crm-pessoas',
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 1) {
          const old = persistedState as any
          return {
            ...old,
            pessoas: (old.pessoas ?? []).map((p: any) => ({
              ...p,
              empresasIds: p.empresasIds ?? (p.empresaId ? [p.empresaId] : []),
            })),
          }
        }
        return { pessoas: [], modalCriar: false, modalEditar: null }
      },
      onRehydrateStorage: () => (state) => {
        if (state) state.refreshFiltrados()
      },
      partialize: (s) => ({ pessoas: s.pessoas }),
    }
  )
)

useAuthStore.subscribe(() => {
  usePessoaStore.getState().refreshFiltrados()
})
