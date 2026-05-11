import { create } from 'zustand'
import toast from 'react-hot-toast'
import { Orcamento, Coluna, TipoObjecao, COLUNA_LABELS, ItemAcao, HistoricoItem } from '../types'
import { nowISO } from '../utils'
import { useAuthStore } from './useAuthStore'
import { useFiltrosStore } from './useFiltrosStore'
import { supabase } from '../lib/supabase'

// --------------- helpers ---------------

function rowToOrcamento(row: Record<string, unknown>): Orcamento {
  return {
    id: row.id as string,
    nome: row.nome as string,
    responsavelId: row.responsavel_id as string,
    valor: row.valor as number | undefined,
    empresaId: row.empresa_id as string | undefined,
    contatosIds: (row.contatos_ids as string[]) ?? [],
    coluna: row.coluna as Coluna,
    probabilidade: row.probabilidade as number | undefined,
    ultimoContatoEm: row.ultimo_contato_em as string | undefined,
    orcamentoEnviadoEm: row.orcamento_enviado_em as string | undefined,
    dataFechamentoEsperada: row.data_fechamento_esperada as string | undefined,
    proximaAtividadeTitulo: row.proxima_atividade_titulo as string | undefined,
    proximaAtividadeData: row.proxima_atividade_data as string | undefined,
    vendidoEm: row.vendido_em as string | undefined,
    dataPerda: row.data_perda as string | undefined,
    dataEntrega: row.data_entrega as string | undefined,
    origem: row.origem as Orcamento['origem'],
    campanhaOfertada: row.campanha_ofertada as Orcamento['campanhaOfertada'],
    fechouPela: row.fechou_pela as Orcamento['fechouPela'],
    tipoObjecao: row.tipo_objecao as TipoObjecao | undefined,
    observacaoObjecao: row.observacao_objecao as string | undefined,
    cenarioAtual: row.cenario_atual as string | undefined,
    itensAcao: (row.itens_acao as ItemAcao[]) ?? [],
    historico: (row.historico as HistoricoItem[]) ?? [],
    ownerId: row.owner_id as string,
    criadoPor: row.criado_por as string,
    atualizadoPor: row.atualizado_por as string,
    criadoEm: row.criado_em as string,
    atualizadoEm: row.atualizado_em as string,
  }
}

function orcamentoToUpdateRow(orc: Orcamento, userId: string): Record<string, unknown> {
  return {
    nome: orc.nome,
    responsavel_id: orc.responsavelId ?? null,
    valor: orc.valor ?? null,
    empresa_id: orc.empresaId ?? null,
    contatos_ids: orc.contatosIds ?? [],
    coluna: orc.coluna,
    probabilidade: orc.probabilidade ?? null,
    ultimo_contato_em: orc.ultimoContatoEm ?? null,
    orcamento_enviado_em: orc.orcamentoEnviadoEm ?? null,
    data_fechamento_esperada: orc.dataFechamentoEsperada ?? null,
    proxima_atividade_titulo: orc.proximaAtividadeTitulo ?? null,
    proxima_atividade_data: orc.proximaAtividadeData ?? null,
    vendido_em: orc.vendidoEm ?? null,
    data_perda: orc.dataPerda ?? null,
    data_entrega: orc.dataEntrega ?? null,
    origem: orc.origem ?? null,
    campanha_ofertada: orc.campanhaOfertada ?? null,
    fechou_pela: orc.fechouPela ?? null,
    tipo_objecao: orc.tipoObjecao ?? null,
    observacao_objecao: orc.observacaoObjecao ?? null,
    cenario_atual: orc.cenarioAtual ?? null,
    itens_acao: orc.itensAcao ?? [],
    historico: orc.historico ?? [],
    atualizado_por: userId,
    atualizado_em: nowISO(),
  }
}

function computeFiltered(orcamentos: Orcamento[]): Orcamento[] {
  const { user } = useAuthStore.getState()
  if (!user || user.role === 'admin') return orcamentos
  return orcamentos.filter((o) => (o.ownerId ?? '') === user.id)
}

function computeFiltradosComBusca(orcamentos: Orcamento[]): Orcamento[] {
  let result = computeFiltered(orcamentos)
  const { busca, responsaveisIds, colunas, origem, campanhaOfertada, dataInicio, dataFim } =
    useFiltrosStore.getState()

  if (busca) {
    const q = busca.toLowerCase()
    result = result.filter((o) => o.nome.toLowerCase().includes(q))
  }
  if (responsaveisIds.length > 0) {
    result = result.filter((o) => responsaveisIds.includes(o.responsavelId))
  }
  if (colunas.length > 0) {
    result = result.filter((o) => colunas.includes(o.coluna))
  }
  if (origem) {
    result = result.filter((o) => o.origem === origem)
  }
  if (campanhaOfertada) {
    result = result.filter((o) => o.campanhaOfertada === campanhaOfertada)
  }
  if (dataInicio) {
    result = result.filter((o) => o.criadoEm >= dataInicio)
  }
  if (dataFim) {
    result = result.filter((o) => o.criadoEm <= dataFim + 'T23:59:59')
  }

  return result
}

function nextId(orcamentos: Orcamento[]): string {
  const nums = orcamentos
    .map((o) => parseInt(o.id.replace('ORC-', ''), 10))
    .filter((n) => !isNaN(n))
  const max = nums.length > 0 ? Math.max(...nums) : 0
  return `ORC-${String(max + 1).padStart(4, '0')}`
}

// --------------- store ---------------

export interface PendingMove {
  orcamentoId: string
  colunaDestino: Coluna
  motivo: 'objecao' | 'perdido'
}

type AddData = Omit<Orcamento, 'id' | 'criadoEm' | 'atualizadoEm' | 'historico' | 'itensAcao' | 'ownerId' | 'criadoPor' | 'atualizadoPor'>

interface OrcamentoStore {
  orcamentos: Orcamento[]
  orcamentosFiltrados: Orcamento[]
  orcamentosFiltradosComBusca: Orcamento[]
  modalCriar: boolean
  modalEditar: Orcamento | null
  modalDetalheId: string | null
  pendingMove: PendingMove | null

  loadAll: () => Promise<void>
  addOrcamento: (data: AddData) => Promise<void>
  updateOrcamento: (id: string, data: Partial<Orcamento>) => Promise<void>
  moveOrcamento: (id: string, coluna: Coluna, tipoObjecao?: TipoObjecao, observacaoObjecao?: string) => Promise<void>
  deleteOrcamento: (id: string) => Promise<void>
  marcarComoGanha: (id: string) => Promise<void>
  marcarComoPerdida: (id: string, tipoObjecao: TipoObjecao, observacao?: string) => Promise<void>
  addItemAcao: (orcamentoId: string, texto: string) => Promise<void>
  toggleItemAcao: (orcamentoId: string, itemId: string) => Promise<void>
  deleteItemAcao: (orcamentoId: string, itemId: string) => Promise<void>
  removePessoaFromAll: (pessoaId: string) => void
  removeEmpresaFromAll: (empresaId: string) => void
  refreshFiltrados: () => void
  refreshFiltradosComBusca: () => void

  setModalCriar: (open: boolean) => void
  setModalEditar: (o: Orcamento | null) => void
  setModalDetalheId: (id: string | null) => void
  setPendingMove: (move: PendingMove | null) => void
}

export const useOrcamentoStore = create<OrcamentoStore>((set, get) => ({
  orcamentos: [],
  orcamentosFiltrados: [],
  orcamentosFiltradosComBusca: [],
  modalCriar: false,
  modalEditar: null,
  modalDetalheId: null,
  pendingMove: null,

  loadAll: async () => {
    const { data, error } = await supabase
      .from('orcamentos')
      .select('*')
      .order('criado_em', { ascending: false })
    if (error) { console.error(error); return }
    const orcamentos = (data as Record<string, unknown>[]).map(rowToOrcamento)
    set({
      orcamentos,
      orcamentosFiltrados: computeFiltered(orcamentos),
      orcamentosFiltradosComBusca: computeFiltradosComBusca(orcamentos),
    })

    supabase
      .channel('orcamentos-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orcamentos' }, () => {
        get().loadAll()
      })
      .subscribe()
  },

  addOrcamento: async (data) => {
    const now = nowISO()
    const userId = useAuthStore.getState().user?.id ?? ''
    const orcamento: Orcamento = {
      ...data,
      id: nextId(get().orcamentos),
      criadoEm: now,
      atualizadoEm: now,
      criadoPor: userId,
      atualizadoPor: userId,
      ownerId: userId,
      contatosIds: data.contatosIds ?? [],
      historico: [{ data: now, texto: 'Orçamento criado', usuarioId: userId }],
      itensAcao: [],
    }

    const { error } = await supabase.from('orcamentos').insert({
      id: orcamento.id,
      nome: orcamento.nome,
      responsavel_id: orcamento.responsavelId ?? null,
      valor: orcamento.valor ?? null,
      empresa_id: orcamento.empresaId ?? null,
      contatos_ids: orcamento.contatosIds,
      coluna: orcamento.coluna,
      probabilidade: orcamento.probabilidade ?? null,
      ultimo_contato_em: orcamento.ultimoContatoEm ?? null,
      orcamento_enviado_em: orcamento.orcamentoEnviadoEm ?? null,
      data_fechamento_esperada: orcamento.dataFechamentoEsperada ?? null,
      proxima_atividade_titulo: orcamento.proximaAtividadeTitulo ?? null,
      proxima_atividade_data: orcamento.proximaAtividadeData ?? null,
      data_entrega: orcamento.dataEntrega ?? null,
      origem: orcamento.origem ?? null,
      campanha_ofertada: orcamento.campanhaOfertada ?? null,
      fechou_pela: orcamento.fechouPela ?? null,
      cenario_atual: orcamento.cenarioAtual ?? null,
      itens_acao: [],
      historico: orcamento.historico,
      owner_id: userId,
      criado_por: userId,
      atualizado_por: userId,
    })

    if (error) {
      toast.error('Erro ao criar orçamento')
      console.error(error)
      return
    }

    set((s) => {
      const orcamentos = [orcamento, ...s.orcamentos]
      return {
        orcamentos,
        orcamentosFiltrados: computeFiltered(orcamentos),
        orcamentosFiltradosComBusca: computeFiltradosComBusca(orcamentos),
      }
    })
  },

  updateOrcamento: async (id, data) => {
    const now = nowISO()
    const userId = useAuthStore.getState().user?.id ?? ''
    const existing = get().orcamentos.find((o) => o.id === id)
    if (!existing) return

    const updated: Orcamento = {
      ...existing,
      ...data,
      ultimoContatoEm: now,
      atualizadoEm: now,
      atualizadoPor: userId,
      historico: [...existing.historico, { data: now, texto: 'Dados atualizados', usuarioId: userId }],
    }

    const { error } = await supabase
      .from('orcamentos')
      .update(orcamentoToUpdateRow(updated, userId))
      .eq('id', id)

    if (error) { toast.error('Erro ao atualizar orçamento'); return }

    set((s) => {
      const orcamentos = s.orcamentos.map((o) => o.id === id ? updated : o)
      return {
        orcamentos,
        orcamentosFiltrados: computeFiltered(orcamentos),
        orcamentosFiltradosComBusca: computeFiltradosComBusca(orcamentos),
      }
    })
  },

  moveOrcamento: async (id, coluna, tipoObjecao, observacaoObjecao) => {
    const now = nowISO()
    const userId = useAuthStore.getState().user?.id ?? ''
    const existing = get().orcamentos.find((o) => o.id === id)
    if (!existing) return

    const updated: Orcamento = {
      ...existing,
      coluna,
      ultimoContatoEm: now,
      atualizadoEm: now,
      atualizadoPor: userId,
      ...(tipoObjecao ? { tipoObjecao, observacaoObjecao } : {}),
      historico: [
        ...existing.historico,
        { data: now, texto: `Movido para: ${COLUNA_LABELS[coluna]}`, usuarioId: userId },
      ],
    }

    const { error } = await supabase
      .from('orcamentos')
      .update(orcamentoToUpdateRow(updated, userId))
      .eq('id', id)

    if (error) { toast.error('Erro ao mover orçamento'); return }

    set((s) => {
      const orcamentos = s.orcamentos.map((o) => o.id === id ? updated : o)
      return {
        orcamentos,
        orcamentosFiltrados: computeFiltered(orcamentos),
        orcamentosFiltradosComBusca: computeFiltradosComBusca(orcamentos),
        pendingMove: null,
      }
    })
  },

  deleteOrcamento: async (id) => {
    const { error } = await supabase.from('orcamentos').delete().eq('id', id)
    if (error) { toast.error('Erro ao deletar orçamento'); return }
    set((s) => {
      const orcamentos = s.orcamentos.filter((o) => o.id !== id)
      return {
        orcamentos,
        orcamentosFiltrados: computeFiltered(orcamentos),
        orcamentosFiltradosComBusca: computeFiltradosComBusca(orcamentos),
      }
    })
  },

  marcarComoGanha: async (id) => {
    const now = nowISO()
    const userId = useAuthStore.getState().user?.id ?? ''
    const existing = get().orcamentos.find((o) => o.id === id)
    if (!existing) return

    const updated: Orcamento = {
      ...existing,
      coluna: 'vendido',
      vendidoEm: now,
      ultimoContatoEm: now,
      atualizadoEm: now,
      atualizadoPor: userId,
      historico: [...existing.historico, { data: now, texto: '🏆 Marcado como Ganho', usuarioId: userId }],
    }

    const { error } = await supabase
      .from('orcamentos')
      .update(orcamentoToUpdateRow(updated, userId))
      .eq('id', id)

    if (error) { toast.error('Erro ao atualizar orçamento'); return }

    set((s) => {
      const orcamentos = s.orcamentos.map((o) => o.id === id ? updated : o)
      return {
        orcamentos,
        orcamentosFiltrados: computeFiltered(orcamentos),
        orcamentosFiltradosComBusca: computeFiltradosComBusca(orcamentos),
      }
    })
  },

  marcarComoPerdida: async (id, tipoObjecao, observacao) => {
    const now = nowISO()
    const userId = useAuthStore.getState().user?.id ?? ''
    const existing = get().orcamentos.find((o) => o.id === id)
    if (!existing) return

    const updated: Orcamento = {
      ...existing,
      coluna: 'perdido',
      dataPerda: now,
      tipoObjecao,
      observacaoObjecao: observacao,
      ultimoContatoEm: now,
      atualizadoEm: now,
      atualizadoPor: userId,
      historico: [
        ...existing.historico,
        { data: now, texto: `😢 Marcado como Perdido — ${tipoObjecao}`, usuarioId: userId },
      ],
    }

    const { error } = await supabase
      .from('orcamentos')
      .update(orcamentoToUpdateRow(updated, userId))
      .eq('id', id)

    if (error) { toast.error('Erro ao atualizar orçamento'); return }

    set((s) => {
      const orcamentos = s.orcamentos.map((o) => o.id === id ? updated : o)
      return {
        orcamentos,
        orcamentosFiltrados: computeFiltered(orcamentos),
        orcamentosFiltradosComBusca: computeFiltradosComBusca(orcamentos),
        pendingMove: null,
      }
    })
  },

  addItemAcao: async (orcamentoId, texto) => {
    const now = nowISO()
    const existing = get().orcamentos.find((o) => o.id === orcamentoId)
    if (!existing) return

    const item: ItemAcao = { id: `ia_${Date.now()}`, texto, concluido: false, criadoEm: now }
    const itensAcao = [...existing.itensAcao, item]

    const { error } = await supabase
      .from('orcamentos')
      .update({ itens_acao: itensAcao })
      .eq('id', orcamentoId)

    if (error) { toast.error('Erro ao adicionar item'); return }

    set((s) => {
      const orcamentos = s.orcamentos.map((o) =>
        o.id === orcamentoId ? { ...o, itensAcao } : o
      )
      return {
        orcamentos,
        orcamentosFiltrados: computeFiltered(orcamentos),
        orcamentosFiltradosComBusca: computeFiltradosComBusca(orcamentos),
      }
    })
  },

  toggleItemAcao: async (orcamentoId, itemId) => {
    const existing = get().orcamentos.find((o) => o.id === orcamentoId)
    if (!existing) return

    const itensAcao = existing.itensAcao.map((i) =>
      i.id === itemId ? { ...i, concluido: !i.concluido } : i
    )

    const { error } = await supabase
      .from('orcamentos')
      .update({ itens_acao: itensAcao })
      .eq('id', orcamentoId)

    if (error) { toast.error('Erro ao atualizar item'); return }

    set((s) => {
      const orcamentos = s.orcamentos.map((o) =>
        o.id === orcamentoId ? { ...o, itensAcao } : o
      )
      return {
        orcamentos,
        orcamentosFiltrados: computeFiltered(orcamentos),
        orcamentosFiltradosComBusca: computeFiltradosComBusca(orcamentos),
      }
    })
  },

  deleteItemAcao: async (orcamentoId, itemId) => {
    const existing = get().orcamentos.find((o) => o.id === orcamentoId)
    if (!existing) return

    const itensAcao = existing.itensAcao.filter((i) => i.id !== itemId)

    const { error } = await supabase
      .from('orcamentos')
      .update({ itens_acao: itensAcao })
      .eq('id', orcamentoId)

    if (error) { toast.error('Erro ao remover item'); return }

    set((s) => {
      const orcamentos = s.orcamentos.map((o) =>
        o.id === orcamentoId ? { ...o, itensAcao } : o
      )
      return {
        orcamentos,
        orcamentosFiltrados: computeFiltered(orcamentos),
        orcamentosFiltradosComBusca: computeFiltradosComBusca(orcamentos),
      }
    })
  },

  removeEmpresaFromAll: (empresaId) => {
    set((s) => {
      const orcamentos = s.orcamentos.map((o) => ({
        ...o,
        empresaId: o.empresaId === empresaId ? undefined : o.empresaId,
      }))
      return {
        orcamentos,
        orcamentosFiltrados: computeFiltered(orcamentos),
        orcamentosFiltradosComBusca: computeFiltradosComBusca(orcamentos),
      }
    })
  },

  removePessoaFromAll: (pessoaId) => {
    set((s) => {
      const orcamentos = s.orcamentos.map((o) => ({
        ...o,
        contatosIds: o.contatosIds.filter((id) => id !== pessoaId),
      }))
      return {
        orcamentos,
        orcamentosFiltrados: computeFiltered(orcamentos),
        orcamentosFiltradosComBusca: computeFiltradosComBusca(orcamentos),
      }
    })
  },

  refreshFiltrados: () =>
    set((s) => ({
      orcamentosFiltrados: computeFiltered(s.orcamentos),
      orcamentosFiltradosComBusca: computeFiltradosComBusca(s.orcamentos),
    })),

  refreshFiltradosComBusca: () =>
    set((s) => ({
      orcamentosFiltradosComBusca: computeFiltradosComBusca(s.orcamentos),
    })),

  setModalCriar: (open) => set({ modalCriar: open }),
  setModalEditar: (o) => set({ modalEditar: o }),
  setModalDetalheId: (id) => set({ modalDetalheId: id }),
  setPendingMove: (move) => set({ pendingMove: move }),
}))

useAuthStore.subscribe(() => {
  useOrcamentoStore.getState().refreshFiltrados()
})

useFiltrosStore.subscribe(() => {
  useOrcamentoStore.getState().refreshFiltradosComBusca()
})
