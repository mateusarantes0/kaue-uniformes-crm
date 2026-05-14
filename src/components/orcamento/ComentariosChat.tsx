import { useState, useEffect, useRef, useCallback } from 'react'
import { useComentariosStore, Comentario } from '../../store/useComentariosStore'
import { useAuthStore } from '../../store/useAuthStore'
import { User } from '../../store/useAuthStore'

interface Props {
  orcamentoId: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  if (h < 48) return 'ontem'
  if (h < 168) return `há ${Math.floor(h / 24)} dias`
  return new Date(iso).toLocaleDateString('pt-BR')
}

function renderTexto(texto: string, users: User[]) {
  const parts = texto.split(/(@\w[\w.]*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      const username = part.slice(1)
      const found = users.find((u) => u.username === username)
      if (found) {
        return (
          <span key={i} className="text-accent bg-accent/10 px-1 py-0.5 rounded text-[13px]">
            @{username}
          </span>
        )
      }
    }
    return <span key={i}>{part}</span>
  })
}

function Iniciais({ nome }: { nome: string }) {
  const ini = nome.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[11px] font-bold flex-shrink-0">
      {ini}
    </div>
  )
}

function detectMention(text: string, cursor: number): { start: number; query: string } | null {
  const before = text.slice(0, cursor)
  const match = before.match(/@(\w[\w.]*)$/)
  if (!match) return null
  return { start: cursor - match[0].length, query: match[1].toLowerCase() }
}

function ComentarioItem({
  c,
  currentUserId,
  isAdmin,
  users,
  orcamentoId,
}: {
  c: Comentario
  currentUserId: string
  isAdmin: boolean
  users: User[]
  orcamentoId: string
}) {
  const editar = useComentariosStore((s) => s.editar)
  const remover = useComentariosStore((s) => s.remover)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(c.texto)

  const autor = users.find((u) => u.id === c.userId)
  const canEdit = c.userId === currentUserId || isAdmin

  const handleCommit = () => {
    if (draft.trim() && draft !== c.texto) editar(c.id, orcamentoId, draft.trim())
    setEditing(false)
  }

  return (
    <div className="flex gap-3 group py-2">
      <Iniciais nome={autor?.name ?? '?'} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-[13px] font-medium text-white">{autor?.name ?? '—'}</span>
          <span className="text-[11px] text-slate-500">{timeAgo(c.criadoEm)}</span>
          {c.editadoEm && <span className="text-[10px] text-slate-600">(editado)</span>}
        </div>

        {editing ? (
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleCommit()
              if (e.key === 'Escape') { setDraft(c.texto); setEditing(false) }
            }}
            className="input text-sm resize-none w-full"
            rows={2}
          />
        ) : (
          <p className="text-[13px] text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
            {renderTexto(c.texto, users)}
          </p>
        )}

        {/* Anexos */}
        {c.anexos.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {c.anexos.map((a, i) => (
              <a
                key={i}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700/50 hover:bg-slate-700 rounded text-[11px] text-slate-300 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                {a.nome}
              </a>
            ))}
          </div>
        )}
      </div>

      {canEdit && !editing && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
            title="Editar"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => { if (confirm('Excluir comentário?')) remover(c.id, orcamentoId) }}
            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
            title="Excluir"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export function ComentariosChat({ orcamentoId }: Props) {
  const comentarios = useComentariosStore((s) => s.porOrcamento[orcamentoId] ?? [])
  const loadByOrcamento = useComentariosStore((s) => s.loadByOrcamento)
  const subscribeOrcamento = useComentariosStore((s) => s.subscribeOrcamento)
  const adicionar = useComentariosStore((s) => s.adicionar)

  const currentUser = useAuthStore((s) => s.user)
  const users = useAuthStore((s) => s.users)
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin')

  const [texto, setTexto] = useState('')
  const [arquivos, setArquivos] = useState<File[]>([])
  const [sending, setSending] = useState(false)
  const [mention, setMention] = useState<{ start: number; query: string } | null>(null)
  const [mentionIdx, setMentionIdx] = useState(0)
  const [mencionados, setMencionados] = useState<string[]>([])

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadByOrcamento(orcamentoId)
    const unsub = subscribeOrcamento(orcamentoId)
    return unsub
  }, [orcamentoId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comentarios.length])

  const filteredUsers = mention
    ? users.filter((u) =>
        u.username.toLowerCase().includes(mention.query) ||
        u.name.toLowerCase().includes(mention.query)
      )
    : []

  const handleTextoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setTexto(val)
    const cursor = e.target.selectionStart ?? val.length
    setMention(detectMention(val, cursor))
    setMentionIdx(0)
  }

  const selectUser = useCallback((user: User) => {
    if (!mention) return
    const before = texto.slice(0, mention.start)
    const after = texto.slice(textareaRef.current?.selectionStart ?? texto.length)
    const newText = `${before}@${user.username} ${after}`
    setTexto(newText)
    setMention(null)
    if (!mencionados.includes(user.id)) setMencionados((prev) => [...prev, user.id])
    setTimeout(() => {
      const pos = mention.start + user.username.length + 2
      textareaRef.current?.setSelectionRange(pos, pos)
      textareaRef.current?.focus()
    }, 0)
  }, [mention, texto, mencionados])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mention && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIdx((i) => (i + 1) % filteredUsers.length) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setMentionIdx((i) => (i - 1 + filteredUsers.length) % filteredUsers.length) }
      else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); selectUser(filteredUsers[mentionIdx]) }
      else if (e.key === 'Escape') setMention(null)
      return
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleEnviar()
  }

  const handleEnviar = async () => {
    if (!texto.trim() && arquivos.length === 0) return
    setSending(true)
    await adicionar(orcamentoId, texto.trim(), mencionados, arquivos)
    setTexto('')
    setArquivos([])
    setMencionados([])
    setSending(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setArquivos((prev) => [...prev, ...files])
    e.target.value = ''
  }

  if (!currentUser) return null

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Lista de comentários */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 divide-y divide-slate-700/30">
        {comentarios.length === 0 && (
          <p className="text-[13px] text-slate-500 italic py-4">Nenhum comentário ainda.</p>
        )}
        {comentarios.map((c) => (
          <ComentarioItem
            key={c.id}
            c={c}
            currentUserId={currentUser.id}
            isAdmin={isAdmin ?? false}
            users={users}
            orcamentoId={orcamentoId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex-shrink-0 relative">
        {/* Dropdown de @mention */}
        {mention && filteredUsers.length > 0 && (
          <div className="absolute bottom-full mb-1 left-0 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 overflow-hidden">
            {filteredUsers.slice(0, 5).map((u, i) => (
              <button
                key={u.id}
                onMouseDown={(e) => { e.preventDefault(); selectUser(u) }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                  i === mentionIdx ? 'bg-accent/20 text-accent' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Iniciais nome={u.name} />
                <div>
                  <div className="text-[13px] font-medium">{u.name}</div>
                  <div className="text-[11px] text-slate-500">@{u.username}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Preview de arquivos */}
        {arquivos.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {arquivos.map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-700/60 rounded text-[11px] text-slate-300"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                {f.name}
                <button
                  onClick={() => setArquivos((prev) => prev.filter((_, j) => j !== i))}
                  className="ml-0.5 text-slate-500 hover:text-red-400"
                >×</button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={texto}
            onChange={handleTextoChange}
            onKeyDown={handleKeyDown}
            placeholder="Escreva um comentário… (@mention, Ctrl+Enter para enviar)"
            rows={2}
            className="input flex-1 resize-none text-sm leading-relaxed"
          />
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <button
              onClick={() => fileRef.current?.click()}
              title="Anexar arquivo"
              className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <button
              onClick={handleEnviar}
              disabled={(!texto.trim() && arquivos.length === 0) || sending}
              title="Enviar (Ctrl+Enter)"
              className="p-2 bg-accent hover:bg-accent-light disabled:opacity-40 text-white rounded-lg transition-colors"
            >
              {sending ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileChange} />
        <p className="text-[10px] text-slate-600 mt-1">@ para mencionar · Ctrl+Enter para enviar</p>
      </div>
    </div>
  )
}
