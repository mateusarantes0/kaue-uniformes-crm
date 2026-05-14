import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './useAuthStore'

export interface Anexo {
  nome: string
  url: string
  tipo: string
  tamanho: number
}

export interface Comentario {
  id: string
  orcamentoId: string
  userId: string
  texto: string
  mencionados: string[]
  anexos: Anexo[]
  criadoEm: string
  editadoEm?: string
}

interface ComentariosStore {
  porOrcamento: Record<string, Comentario[]>
  loadByOrcamento: (orcamentoId: string) => Promise<void>
  adicionar: (orcamentoId: string, texto: string, mencionados: string[], arquivos: File[]) => Promise<void>
  editar: (id: string, orcamentoId: string, texto: string) => Promise<void>
  remover: (id: string, orcamentoId: string) => Promise<void>
  subscribeOrcamento: (orcamentoId: string) => () => void
}

function rowToComentario(row: Record<string, unknown>): Comentario {
  return {
    id: row.id as string,
    orcamentoId: row.orcamento_id as string,
    userId: row.user_id as string,
    texto: row.texto as string,
    mencionados: (row.mencionados as string[]) ?? [],
    anexos: (row.anexos as Anexo[]) ?? [],
    criadoEm: row.criado_em as string,
    editadoEm: row.editado_em as string | undefined,
  }
}

export const useComentariosStore = create<ComentariosStore>((set, get) => ({
  porOrcamento: {},

  loadByOrcamento: async (orcamentoId) => {
    const { data, error } = await supabase
      .from('comentarios')
      .select('*')
      .eq('orcamento_id', orcamentoId)
      .order('criado_em', { ascending: true })
    if (error) { console.error('Erro ao carregar comentários:', error); return }
    const comentarios = (data as Record<string, unknown>[]).map(rowToComentario)
    set((s) => ({ porOrcamento: { ...s.porOrcamento, [orcamentoId]: comentarios } }))
  },

  adicionar: async (orcamentoId, texto, mencionados, arquivos) => {
    const userId = useAuthStore.getState().user?.id ?? ''
    const anexos: Anexo[] = []

    for (const file of arquivos) {
      const path = `${userId}/${orcamentoId}/${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage
        .from('comentarios-anexos')
        .upload(path, file)
      if (upErr) { console.error('Erro upload:', upErr); continue }

      const { data: signed } = await supabase.storage
        .from('comentarios-anexos')
        .createSignedUrl(path, 31536000)
      if (signed?.signedUrl) {
        anexos.push({ nome: file.name, url: signed.signedUrl, tipo: file.type, tamanho: file.size })
      }
    }

    const { data: rows, error } = await supabase
      .from('comentarios')
      .insert({ orcamento_id: orcamentoId, user_id: userId, texto, mencionados, anexos })
      .select()
    if (error) { console.error('Erro ao inserir comentário:', error); return }

    const novo = rowToComentario(rows![0] as Record<string, unknown>)
    set((s) => ({
      porOrcamento: {
        ...s.porOrcamento,
        [orcamentoId]: [...(s.porOrcamento[orcamentoId] ?? []), novo],
      },
    }))

    // Notificar usuários mencionados
    const orcamento = await supabase
      .from('orcamentos').select('nome').eq('id', orcamentoId).single()
    const nomeOrc = orcamento.data?.nome ?? orcamentoId

    for (const uid of mencionados) {
      if (uid === userId) continue
      await supabase.from('notificacoes').insert({
        user_id: uid,
        tipo: 'sistema',
        titulo: 'Você foi mencionado',
        mensagem: `Mencionado no orçamento "${nomeOrc}".`,
        orcamento_id: orcamentoId,
      })
    }
  },

  editar: async (id, orcamentoId, texto) => {
    const agora = new Date().toISOString()
    const { error } = await supabase
      .from('comentarios')
      .update({ texto, editado_em: agora })
      .eq('id', id)
    if (error) return
    set((s) => ({
      porOrcamento: {
        ...s.porOrcamento,
        [orcamentoId]: (s.porOrcamento[orcamentoId] ?? []).map((c) =>
          c.id === id ? { ...c, texto, editadoEm: agora } : c
        ),
      },
    }))
  },

  remover: async (id, orcamentoId) => {
    const { error } = await supabase.from('comentarios').delete().eq('id', id)
    if (error) return
    set((s) => ({
      porOrcamento: {
        ...s.porOrcamento,
        [orcamentoId]: (s.porOrcamento[orcamentoId] ?? []).filter((c) => c.id !== id),
      },
    }))
  },

  subscribeOrcamento: (orcamentoId) => {
    const channel = supabase
      .channel(`comentarios-${orcamentoId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comentarios', filter: `orcamento_id=eq.${orcamentoId}` },
        () => {
          useComentariosStore.getState().loadByOrcamento(orcamentoId)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  },
}))
