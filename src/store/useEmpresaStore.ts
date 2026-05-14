import { create } from 'zustand'
import toast from 'react-hot-toast'
import { Empresa } from '../types'
import { nowISO } from '../utils'
import { useAuthStore } from './useAuthStore'
import { supabase } from '../lib/supabase'
import { _registerEmpresaRef } from './useOrcamentoStore'

// --------------- helpers ---------------

function rowToEmpresa(row: Record<string, unknown>): Empresa {
  return {
    id: row.id as string,
    nome: row.nome as string,
    responsaveisIds: (row.responsaveis_ids as string[]) ?? [],
    razaoSocial: row.razao_social as string | undefined,
    cnpj: row.cnpj as string | undefined,
    segmento: row.segmento as Empresa['segmento'],
    tipoCliente: row.tipo_cliente as Empresa['tipoCliente'],
    grupoEstrategico: row.grupo_estrategico as Empresa['grupoEstrategico'],
    frequencia: row.frequencia as Empresa['frequencia'],
    statusCliente: row.status_cliente as Empresa['statusCliente'],
    porteEmpresa: row.porte_empresa as Empresa['porteEmpresa'],
    site: row.site as string | undefined,
    email: row.email as string | undefined,
    instagram: row.instagram as string | undefined,
    linkedin: row.linkedin as string | undefined,
    endereco: row.endereco as string | undefined,
    cidade: row.cidade as string | undefined,
    uf: row.uf as Empresa['uf'],
    ownerId: row.owner_id as string,
    criadoPor: row.criado_por as string,
    atualizadoPor: row.atualizado_por as string,
    criadoEm: row.criado_em as string,
    atualizadoEm: row.atualizado_em as string,
  }
}

function computeFiltered(empresas: Empresa[]): Empresa[] {
  return empresas
}

function nextId(): string {
  return `EMP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

// --------------- store ---------------

type AddData = Omit<Empresa, 'id' | 'criadoEm' | 'atualizadoEm' | 'ownerId' | 'criadoPor' | 'atualizadoPor'>

interface EmpresaStore {
  empresas: Empresa[]
  empresasFiltradas: Empresa[]
  modalCriar: boolean
  modalEditar: Empresa | null

  loadAll: () => Promise<void>
  addEmpresa: (data: AddData) => Promise<Empresa | null>
  updateEmpresa: (id: string, data: Partial<Empresa>) => Promise<void>
  deleteEmpresa: (id: string) => Promise<void>
  removeEmpresaFromAll: (empresaId: string) => void
  refreshFiltrados: () => void

  setModalCriar: (open: boolean) => void
  setModalEditar: (e: Empresa | null) => void
}

export const useEmpresaStore = create<EmpresaStore>((set, get) => ({
  empresas: [],
  empresasFiltradas: [],
  modalCriar: false,
  modalEditar: null,

  loadAll: async () => {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .order('criado_em', { ascending: false })
    if (error) { console.error(error); return }
    const empresas = (data as Record<string, unknown>[]).map(rowToEmpresa)
    set({ empresas, empresasFiltradas: computeFiltered(empresas) })
  },

  addEmpresa: async (data) => {
    const now = nowISO()
    const userId = useAuthStore.getState().user?.id ?? ''
    const empresa: Empresa = {
      ...data,
      id: nextId(),
      criadoEm: now,
      atualizadoEm: now,
      criadoPor: userId,
      atualizadoPor: userId,
      ownerId: userId,
      responsaveisIds: data.responsaveisIds ?? [],
    }

    const { error } = await supabase.from('empresas').insert({
      id: empresa.id,
      nome: empresa.nome,
      responsaveis_ids: empresa.responsaveisIds,
      razao_social: empresa.razaoSocial ?? null,
      cnpj: empresa.cnpj ?? null,
      segmento: empresa.segmento ?? null,
      tipo_cliente: empresa.tipoCliente ?? null,
      grupo_estrategico: empresa.grupoEstrategico ?? null,
      frequencia: empresa.frequencia ?? null,
      status_cliente: empresa.statusCliente ?? null,
      porte_empresa: empresa.porteEmpresa ?? null,
      site: empresa.site ?? null,
      email: empresa.email ?? null,
      instagram: empresa.instagram ?? null,
      linkedin: empresa.linkedin ?? null,
      endereco: empresa.endereco ?? null,
      cidade: empresa.cidade ?? null,
      uf: empresa.uf ?? null,
      owner_id: userId,
      criado_por: userId,
      atualizado_por: userId,
    })

    if (error) {
      toast.error('Erro ao salvar empresa')
      console.error(error)
      return null
    }

    set((s) => {
      const empresas = [empresa, ...s.empresas]
      return { empresas, empresasFiltradas: computeFiltered(empresas) }
    })
    return empresa
  },

  updateEmpresa: async (id, data) => {
    const now = nowISO()
    const userId = useAuthStore.getState().user?.id ?? ''
    const existing = get().empresas.find((e) => e.id === id)
    if (!existing) return

    const updated: Empresa = { ...existing, ...data, atualizadoEm: now, atualizadoPor: userId }

    const { error } = await supabase.from('empresas').update({
      nome: updated.nome,
      responsaveis_ids: updated.responsaveisIds ?? [],
      razao_social: updated.razaoSocial ?? null,
      cnpj: updated.cnpj ?? null,
      segmento: updated.segmento ?? null,
      tipo_cliente: updated.tipoCliente ?? null,
      grupo_estrategico: updated.grupoEstrategico ?? null,
      frequencia: updated.frequencia ?? null,
      status_cliente: updated.statusCliente ?? null,
      porte_empresa: updated.porteEmpresa ?? null,
      site: updated.site ?? null,
      email: updated.email ?? null,
      instagram: updated.instagram ?? null,
      linkedin: updated.linkedin ?? null,
      endereco: updated.endereco ?? null,
      cidade: updated.cidade ?? null,
      uf: updated.uf ?? null,
      atualizado_por: userId,
      atualizado_em: now,
    }).eq('id', id)

    if (error) { toast.error('Erro ao atualizar empresa'); return }

    set((s) => {
      const empresas = s.empresas.map((e) => e.id === id ? updated : e)
      return { empresas, empresasFiltradas: computeFiltered(empresas) }
    })
  },

  deleteEmpresa: async (id) => {
    const { error } = await supabase.from('empresas').delete().eq('id', id)
    if (error) { toast.error('Erro ao deletar empresa'); return }

    set((s) => {
      const empresas = s.empresas.filter((e) => e.id !== id)
      return { empresas, empresasFiltradas: computeFiltered(empresas) }
    })

    // Cascade: remove empresa from pessoas.empresasIds
    const { usePessoaStore } = await import('./usePessoaStore')
    const ps = usePessoaStore.getState()
    const affected = ps.pessoas.filter((p) => (p.empresasIds ?? []).includes(id))
    for (const p of affected) {
      await ps.updatePessoa(p.id, { empresasIds: p.empresasIds.filter((eid) => eid !== id) })
    }

    // Update orcamentos local state (DB handles empresa_id via ON DELETE SET NULL)
    const { useOrcamentoStore } = await import('./useOrcamentoStore')
    useOrcamentoStore.getState().removeEmpresaFromAll(id)
  },

  // No-op — kept for interface compatibility with useOrcamentoStore calls
  removeEmpresaFromAll: (_empresaId: string) => { /* unused here */ },

  refreshFiltrados: () => set((s) => ({ empresasFiltradas: computeFiltered(s.empresas) })),
  setModalCriar: (open) => set({ modalCriar: open }),
  setModalEditar: (e) => set({ modalEditar: e }),
}))

_registerEmpresaRef(() => useEmpresaStore.getState().empresas as { id: string; tipoCliente?: string; grupoEstrategico?: string; segmento?: string }[])

useAuthStore.subscribe(() => {
  useEmpresaStore.getState().refreshFiltrados()
})

supabase
  .channel('empresas-rt')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'empresas' }, () => {
    useEmpresaStore.getState().loadAll()
  })
  .subscribe()
