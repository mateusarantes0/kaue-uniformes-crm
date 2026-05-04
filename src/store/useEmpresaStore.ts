import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Empresa } from '../types'
import { nowISO } from '../utils'
import { useAuthStore } from './useAuthStore'
import { sampleEmpresas } from '../data/sampleData'

function computeFiltered(empresas: Empresa[]): Empresa[] {
  const { user } = useAuthStore.getState()
  if (!user || user.role === 'admin') return empresas
  return empresas.filter((e) => e.ownerId === user.id)
}

function nextId(empresas: Empresa[]): string {
  const nums = empresas
    .map((e) => parseInt(e.id.replace('EMP-', ''), 10))
    .filter((n) => !isNaN(n))
  const max = nums.length > 0 ? Math.max(...nums) : 0
  return `EMP-${String(max + 1).padStart(4, '0')}`
}

type AddData = Omit<Empresa, 'id' | 'criadoEm' | 'atualizadoEm' | 'ownerId' | 'criadoPor' | 'atualizadoPor'>

interface EmpresaStore {
  empresas: Empresa[]
  empresasFiltradas: Empresa[]
  modalCriar: boolean
  modalEditar: Empresa | null

  addEmpresa: (data: AddData) => Empresa
  updateEmpresa: (id: string, data: Partial<Empresa>) => void
  deleteEmpresa: (id: string) => void
  refreshFiltrados: () => void

  setModalCriar: (open: boolean) => void
  setModalEditar: (e: Empresa | null) => void
}

export const useEmpresaStore = create<EmpresaStore>()(
  persist(
    (set, get) => ({
      empresas: sampleEmpresas,
      empresasFiltradas: sampleEmpresas,
      modalCriar: false,
      modalEditar: null,

      addEmpresa: (data) => {
        const now = nowISO()
        const userId = useAuthStore.getState().user?.id ?? 'admin'
        const empresa: Empresa = {
          ...data,
          id: nextId(get().empresas),
          criadoEm: now,
          atualizadoEm: now,
          criadoPor: userId,
          atualizadoPor: userId,
          ownerId: userId,
          responsaveisIds: data.responsaveisIds ?? [],
        }
        set((s) => {
          const empresas = [...s.empresas, empresa]
          return { empresas, empresasFiltradas: computeFiltered(empresas) }
        })
        return empresa
      },

      updateEmpresa: (id, data) => {
        set((s) => {
          const now = nowISO()
          const userId = useAuthStore.getState().user?.id ?? 'admin'
          const empresas = s.empresas.map((e) =>
            e.id === id ? { ...e, ...data, atualizadoEm: now, atualizadoPor: userId } : e
          )
          return { empresas, empresasFiltradas: computeFiltered(empresas) }
        })
      },

      deleteEmpresa: (id) => {
        set((s) => {
          const empresas = s.empresas.filter((e) => e.id !== id)
          return { empresas, empresasFiltradas: computeFiltered(empresas) }
        })
        // cascade: remove from orcamentos and pessoas
        import('./useOrcamentoStore').then(({ useOrcamentoStore }) => {
          useOrcamentoStore.getState().removeEmpresaFromAll(id)
        })
        import('./usePessoaStore').then(({ usePessoaStore }) => {
          const store = usePessoaStore.getState()
          store.pessoas
            .filter((p) => p.empresaId === id)
            .forEach((p) => store.updatePessoa(p.id, { empresaId: undefined }))
        })
      },

      refreshFiltrados: () =>
        set((s) => ({ empresasFiltradas: computeFiltered(s.empresas) })),

      setModalCriar: (open) => set({ modalCriar: open }),
      setModalEditar: (e) => set({ modalEditar: e }),
    }),
    {
      name: 'kaue-crm-empresas',
      version: 1,
      migrate: () => ({ empresas: [], modalCriar: false, modalEditar: null }),
      onRehydrateStorage: () => (state) => {
        if (state) state.refreshFiltrados()
      },
      partialize: (s) => ({ empresas: s.empresas }),
    }
  )
)

useAuthStore.subscribe(() => {
  useEmpresaStore.getState().refreshFiltrados()
})
