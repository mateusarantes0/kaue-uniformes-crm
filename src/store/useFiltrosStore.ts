import { create } from 'zustand'
import { Coluna } from '../types'

export type OperadorLogico = 'AND' | 'OR'

export interface Condicao {
  id: string
  campo: string
  valor: string
}

export interface GrupoCondicoes {
  id: string
  operador: OperadorLogico
  condicoes: Condicao[]
}

function makeId() {
  return Math.random().toString(36).slice(2, 9)
}

interface FiltrosStore {
  busca: string
  operadorRaiz: OperadorLogico
  grupos: GrupoCondicoes[]
  dataInicio: string
  dataFim: string
  filtrosModalOpen: boolean
  quickFilterColunas: Coluna[] | null
  quickFilterSemContato: boolean

  update: (patch: Partial<Pick<FiltrosStore, 'busca' | 'operadorRaiz' | 'dataInicio' | 'dataFim' | 'filtrosModalOpen'>>) => void
  addGrupo: () => void
  removeGrupo: (id: string) => void
  setGrupoOperador: (grupoId: string, op: OperadorLogico) => void
  addCondicao: (grupoId: string) => void
  removeCondicao: (grupoId: string, condId: string) => void
  updateCondicao: (grupoId: string, condId: string, patch: Partial<Omit<Condicao, 'id'>>) => void
  setQuickFilterColunas: (colunas: Coluna[] | null) => void
  setQuickFilterSemContato: (v: boolean) => void
  clearQuickFilter: () => void
  resetFiltros: () => void
  hasFiltros: () => boolean
}

const emptyGrupo = (): GrupoCondicoes => ({
  id: makeId(),
  operador: 'AND',
  condicoes: [{ id: makeId(), campo: 'responsavel', valor: '' }],
})

export const useFiltrosStore = create<FiltrosStore>((set, get) => ({
  busca: '',
  operadorRaiz: 'AND',
  grupos: [],
  dataInicio: '',
  dataFim: '',
  filtrosModalOpen: false,
  quickFilterColunas: null,
  quickFilterSemContato: false,

  update: (patch) => set(patch as Partial<FiltrosStore>),

  addGrupo: () =>
    set((s) => ({ grupos: [...s.grupos, emptyGrupo()] })),

  removeGrupo: (id) =>
    set((s) => ({ grupos: s.grupos.filter((g) => g.id !== id) })),

  setGrupoOperador: (grupoId, op) =>
    set((s) => ({
      grupos: s.grupos.map((g) => g.id === grupoId ? { ...g, operador: op } : g),
    })),

  addCondicao: (grupoId) =>
    set((s) => ({
      grupos: s.grupos.map((g) =>
        g.id === grupoId
          ? { ...g, condicoes: [...g.condicoes, { id: makeId(), campo: 'responsavel', valor: '' }] }
          : g
      ),
    })),

  removeCondicao: (grupoId, condId) =>
    set((s) => ({
      grupos: s.grupos.map((g) =>
        g.id === grupoId
          ? { ...g, condicoes: g.condicoes.filter((c) => c.id !== condId) }
          : g
      ),
    })),

  updateCondicao: (grupoId, condId, patch) =>
    set((s) => ({
      grupos: s.grupos.map((g) =>
        g.id === grupoId
          ? {
              ...g,
              condicoes: g.condicoes.map((c) =>
                c.id === condId ? { ...c, ...patch } : c
              ),
            }
          : g
      ),
    })),

  setQuickFilterColunas: (colunas) =>
    set({ quickFilterColunas: colunas, quickFilterSemContato: false }),

  setQuickFilterSemContato: (v) =>
    set({ quickFilterSemContato: v, quickFilterColunas: null }),

  clearQuickFilter: () =>
    set({ quickFilterColunas: null, quickFilterSemContato: false }),

  resetFiltros: () =>
    set((s) => ({
      busca: '',
      operadorRaiz: 'AND',
      grupos: [],
      dataInicio: '',
      dataFim: '',
      filtrosModalOpen: s.filtrosModalOpen,
      quickFilterColunas: null,
      quickFilterSemContato: false,
    })),

  hasFiltros: () => {
    const { busca, grupos, dataInicio, dataFim, quickFilterColunas, quickFilterSemContato } = get()
    const gruposComCondicoes = grupos.filter((g) => g.condicoes.some((c) => c.valor))
    return !!busca || gruposComCondicoes.length > 0 || !!dataInicio || !!dataFim || quickFilterColunas !== null || quickFilterSemContato
  },
}))
