import { create } from 'zustand'
import toast from 'react-hot-toast'
import { Pessoa } from '../types'
import { nowISO } from '../utils'
import { useAuthStore } from './useAuthStore'
import { supabase } from '../lib/supabase'
import { _registerPessoaRef } from './useOrcamentoStore'

// --------------- helpers ---------------

function rowToPessoa(row: Record<string, unknown>): Pessoa {
  return {
    id: row.id as string,
    nome: row.nome as string,
    responsaveisIds: (row.responsaveis_ids as string[]) ?? [],
    telefone: row.telefone as string | undefined,
    empresasIds: (row.empresas_ids as string[]) ?? [],
    tipoContato: row.tipo_contato as Pessoa['tipoContato'],
    cargo: row.cargo as Pessoa['cargo'],
    grauInfluencia: row.grau_influencia as Pessoa['grauInfluencia'],
    email: row.email as string | undefined,
    instagram: row.instagram as string | undefined,
    linkedin: row.linkedin as string | undefined,
    etiquetas: (row.etiquetas as string[]) ?? [],
    cpf: row.cpf as string | undefined,
    dataNascimento: row.data_nascimento as string | undefined,
    sexo: row.sexo as Pessoa['sexo'],
    endereco: row.endereco as string | undefined,
    cidade: row.cidade as string | undefined,
    uf: row.uf as Pessoa['uf'],
    avaliouNoGoogle: row.avaliou_no_google as Pessoa['avaliouNoGoogle'],
    pedimosIndicacao: row.pedimos_indicacao as Pessoa['pedimosIndicacao'],
    indicacoes: row.indicacoes as string | undefined,
    ownerId: row.owner_id as string,
    criadoPor: row.criado_por as string,
    atualizadoPor: row.atualizado_por as string,
    criadoEm: row.criado_em as string,
    atualizadoEm: row.atualizado_em as string,
  }
}

function computeFiltered(pessoas: Pessoa[]): Pessoa[] {
  const { user } = useAuthStore.getState()
  if (!user || user.role === 'admin') return pessoas
  return pessoas.filter((p) => p.ownerId === user.id)
}

function nextId(): string {
  return `PES-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

// --------------- store ---------------

type AddData = Omit<Pessoa, 'id' | 'criadoEm' | 'atualizadoEm' | 'ownerId' | 'criadoPor' | 'atualizadoPor'>

interface PessoaStore {
  pessoas: Pessoa[]
  pessoasFiltradas: Pessoa[]
  modalCriar: boolean
  modalEditar: Pessoa | null

  loadAll: () => Promise<void>
  addPessoa: (data: AddData) => Promise<Pessoa | null>
  updatePessoa: (id: string, data: Partial<Pessoa>) => Promise<void>
  deletePessoa: (id: string) => Promise<void>
  refreshFiltrados: () => void

  setModalCriar: (open: boolean) => void
  setModalEditar: (p: Pessoa | null) => void
}

export const usePessoaStore = create<PessoaStore>((set, get) => ({
  pessoas: [],
  pessoasFiltradas: [],
  modalCriar: false,
  modalEditar: null,

  loadAll: async () => {
    const { data, error } = await supabase
      .from('pessoas')
      .select('*')
      .order('criado_em', { ascending: false })
    if (error) { console.error(error); return }
    const pessoas = (data as Record<string, unknown>[]).map(rowToPessoa)
    set({ pessoas, pessoasFiltradas: computeFiltered(pessoas) })
  },

  addPessoa: async (data) => {
    const now = nowISO()
    const userId = useAuthStore.getState().user?.id ?? ''
    const pessoa: Pessoa = {
      ...data,
      id: nextId(),
      criadoEm: now,
      atualizadoEm: now,
      criadoPor: userId,
      atualizadoPor: userId,
      ownerId: userId,
      responsaveisIds: data.responsaveisIds ?? [],
      empresasIds: data.empresasIds ?? [],
    }

    const { error } = await supabase.from('pessoas').insert({
      id: pessoa.id,
      nome: pessoa.nome,
      responsaveis_ids: pessoa.responsaveisIds,
      telefone: pessoa.telefone ?? null,
      empresas_ids: pessoa.empresasIds,
      tipo_contato: pessoa.tipoContato ?? null,
      cargo: pessoa.cargo ?? null,
      grau_influencia: pessoa.grauInfluencia ?? null,
      email: pessoa.email ?? null,
      instagram: pessoa.instagram ?? null,
      linkedin: pessoa.linkedin ?? null,
      etiquetas: pessoa.etiquetas ?? [],
      cpf: pessoa.cpf ?? null,
      data_nascimento: pessoa.dataNascimento ?? null,
      sexo: pessoa.sexo ?? null,
      endereco: pessoa.endereco ?? null,
      cidade: pessoa.cidade ?? null,
      uf: pessoa.uf ?? null,
      avaliou_no_google: pessoa.avaliouNoGoogle ?? null,
      pedimos_indicacao: pessoa.pedimosIndicacao ?? null,
      indicacoes: pessoa.indicacoes ?? null,
      owner_id: userId,
      criado_por: userId,
      atualizado_por: userId,
    })

    if (error) {
      toast.error('Erro ao salvar pessoa')
      console.error(error)
      return null
    }

    set((s) => {
      const pessoas = [pessoa, ...s.pessoas]
      return { pessoas, pessoasFiltradas: computeFiltered(pessoas) }
    })
    return pessoa
  },

  updatePessoa: async (id, data) => {
    const now = nowISO()
    const userId = useAuthStore.getState().user?.id ?? ''
    const existing = get().pessoas.find((p) => p.id === id)
    if (!existing) return

    const updated: Pessoa = { ...existing, ...data, atualizadoEm: now, atualizadoPor: userId }

    const { error } = await supabase.from('pessoas').update({
      nome: updated.nome,
      responsaveis_ids: updated.responsaveisIds ?? [],
      telefone: updated.telefone ?? null,
      empresas_ids: updated.empresasIds ?? [],
      tipo_contato: updated.tipoContato ?? null,
      cargo: updated.cargo ?? null,
      grau_influencia: updated.grauInfluencia ?? null,
      email: updated.email ?? null,
      instagram: updated.instagram ?? null,
      linkedin: updated.linkedin ?? null,
      etiquetas: updated.etiquetas ?? [],
      cpf: updated.cpf ?? null,
      data_nascimento: updated.dataNascimento ?? null,
      sexo: updated.sexo ?? null,
      endereco: updated.endereco ?? null,
      cidade: updated.cidade ?? null,
      uf: updated.uf ?? null,
      avaliou_no_google: updated.avaliouNoGoogle ?? null,
      pedimos_indicacao: updated.pedimosIndicacao ?? null,
      indicacoes: updated.indicacoes ?? null,
      atualizado_por: userId,
      atualizado_em: now,
    }).eq('id', id)

    if (error) { toast.error('Erro ao atualizar pessoa'); return }

    set((s) => {
      const pessoas = s.pessoas.map((p) => p.id === id ? updated : p)
      return { pessoas, pessoasFiltradas: computeFiltered(pessoas) }
    })
  },

  deletePessoa: async (id) => {
    const { error } = await supabase.from('pessoas').delete().eq('id', id)
    if (error) { toast.error('Erro ao deletar pessoa'); return }

    set((s) => {
      const pessoas = s.pessoas.filter((p) => p.id !== id)
      return { pessoas, pessoasFiltradas: computeFiltered(pessoas) }
    })

    // Cascade: remove pessoa from orcamentos.contatosIds
    const { useOrcamentoStore } = await import('./useOrcamentoStore')
    const os = useOrcamentoStore.getState()
    const affected = os.orcamentos.filter((o) => o.contatosIds.includes(id))
    for (const o of affected) {
      await os.updateOrcamento(o.id, {
        contatosIds: o.contatosIds.filter((cid) => cid !== id),
      })
    }
  },

  refreshFiltrados: () => set((s) => ({ pessoasFiltradas: computeFiltered(s.pessoas) })),
  setModalCriar: (open) => set({ modalCriar: open }),
  setModalEditar: (p) => set({ modalEditar: p }),
}))

_registerPessoaRef(() => usePessoaStore.getState().pessoas as { id: string; etiquetas: string[] }[])

useAuthStore.subscribe(() => {
  usePessoaStore.getState().refreshFiltrados()
})

supabase
  .channel('pessoas-rt')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'pessoas' }, () => {
    usePessoaStore.getState().loadAll()
  })
  .subscribe()
