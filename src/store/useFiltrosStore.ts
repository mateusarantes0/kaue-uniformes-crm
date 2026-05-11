import { create } from 'zustand'
import { Campanha, Coluna, Origem } from '../types'

interface FiltrosStore {
  busca: string
  responsaveisIds: string[]
  colunas: Coluna[]
  origem: Origem | ''
  campanhaOfertada: Campanha | ''
  dataInicio: string
  dataFim: string
  filtrosModalOpen: boolean

  update: (patch: Partial<Omit<FiltrosStore, 'update' | 'resetFiltros' | 'hasFiltros'>>) => void
  resetFiltros: () => void
  hasFiltros: () => boolean
}

const defaults = {
  busca: '',
  responsaveisIds: [] as string[],
  colunas: [] as Coluna[],
  origem: '' as Origem | '',
  campanhaOfertada: '' as Campanha | '',
  dataInicio: '',
  dataFim: '',
  filtrosModalOpen: false,
}

export const useFiltrosStore = create<FiltrosStore>((set, get) => ({
  ...defaults,

  update: (patch) => set(patch as Partial<FiltrosStore>),

  resetFiltros: () => set({ ...defaults, filtrosModalOpen: get().filtrosModalOpen }),

  hasFiltros: () => {
    const { busca, responsaveisIds, colunas, origem, campanhaOfertada, dataInicio, dataFim } = get()
    return (
      !!busca ||
      responsaveisIds.length > 0 ||
      colunas.length > 0 ||
      !!origem ||
      !!campanhaOfertada ||
      !!dataInicio ||
      !!dataFim
    )
  },
}))
