import { useState, useEffect } from 'react'
import { useAtividadesStore } from '../../store/useAtividadesStore'

interface Props {
  orcamentoId: string
}

function formatDataAtividade(data: string, hora?: string): string {
  const d = new Date(data + 'T12:00:00')
  const hoje = new Date()
  const amanha = new Date(hoje); amanha.setDate(amanha.getDate() + 1)
  const dataStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  const isHoje = d.toDateString() === hoje.toDateString()
  const isAmanha = d.toDateString() === amanha.toDateString()
  const label = isHoje ? 'Hoje' : isAmanha ? 'Amanhã' : dataStr
  return hora ? `${label} às ${hora.slice(0, 5)}` : label
}

function isVencida(data: string): boolean {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const d = new Date(data + 'T00:00:00')
  return d < hoje
}

export function AtividadesLista({ orcamentoId }: Props) {
  const atividades = useAtividadesStore((s) => s.porOrcamento[orcamentoId] ?? [])
  const loadByOrcamento = useAtividadesStore((s) => s.loadByOrcamento)
  const adicionar = useAtividadesStore((s) => s.adicionar)
  const marcarConcluida = useAtividadesStore((s) => s.marcarConcluida)
  const remover = useAtividadesStore((s) => s.remover)

  const [showForm, setShowForm] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [data, setData] = useState('')
  const [hora, setHora] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadByOrcamento(orcamentoId)
  }, [orcamentoId])

  const pendentes = atividades.filter((a) => !a.concluida).sort((a, b) => a.data.localeCompare(b.data))
  const concluidas = atividades.filter((a) => a.concluida).sort((a, b) => b.data.localeCompare(a.data))

  const handleAdicionar = async () => {
    if (!titulo.trim() || !data) return
    setSaving(true)
    await adicionar(orcamentoId, titulo.trim(), data, hora || undefined)
    setTitulo(''); setData(''); setHora(''); setShowForm(false)
    setSaving(false)
  }

  const todayISO = new Date().toISOString().split('T')[0]

  return (
    <div>
      {/* Pendentes */}
      <div className="space-y-1">
        {pendentes.map((a) => {
          const vencida = isVencida(a.data)
          return (
            <div
              key={a.id}
              className={`flex items-center gap-2 py-1.5 px-2 rounded-lg group ${
                vencida ? 'bg-red-500/10' : 'hover:bg-slate-700/30'
              }`}
            >
              <button
                onClick={() => marcarConcluida(a.id, orcamentoId)}
                className="flex-shrink-0 w-4 h-4 rounded border border-slate-600 hover:border-accent transition-colors flex items-center justify-center"
                title="Concluir"
              />
              <div className="flex-1 min-w-0">
                <span className={`text-[13px] ${vencida ? 'text-red-300' : 'text-white'}`}>
                  {a.titulo}
                </span>
                <span className={`ml-2 text-[11px] ${vencida ? 'text-red-400' : 'text-slate-500'}`}>
                  {formatDataAtividade(a.data, a.hora)}
                </span>
              </div>
              <button
                onClick={() => remover(a.id, orcamentoId)}
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-0.5"
                title="Remover"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>

      {/* Form de adicionar */}
      {showForm ? (
        <div className="mt-2 p-3 bg-slate-800/60 rounded-lg border border-slate-700 space-y-2">
          <input
            autoFocus
            className="input text-sm w-full"
            placeholder="O que precisa fazer?"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') setShowForm(false) }}
          />
          <div className="flex gap-2">
            <input
              className="input text-sm flex-1"
              type="date"
              value={data}
              defaultValue={todayISO}
              onChange={(e) => setData(e.target.value)}
            />
            <input
              className="input text-sm w-28"
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              placeholder="Hora (opt)"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="btn-ghost text-xs px-3 py-1.5">Cancelar</button>
            <button
              onClick={handleAdicionar}
              disabled={!titulo.trim() || !data || saving}
              className="btn-primary text-xs px-3 py-1.5"
            >
              {saving ? 'Salvando...' : 'Adicionar'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => { setShowForm(true); setData(todayISO) }}
          className="mt-2 flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-accent transition-colors py-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Adicionar atividade
        </button>
      )}

      {/* Concluídas */}
      {concluidas.length > 0 && (
        <div className="mt-3 space-y-1 border-t border-slate-700/50 pt-2">
          {concluidas.map((a) => (
            <div key={a.id} className="flex items-center gap-2 py-1 px-2 rounded-lg group opacity-50 hover:opacity-70">
              <button
                onClick={() => marcarConcluida(a.id, orcamentoId)}
                className="flex-shrink-0 w-4 h-4 rounded border border-green-700 bg-green-900/30 flex items-center justify-center"
                title="Desfazer"
              >
                <svg className="w-2.5 h-2.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <span className="text-[12px] text-slate-500 line-through flex-1">{a.titulo}</span>
              <span className="text-[11px] text-slate-600">{formatDataAtividade(a.data, a.hora)}</span>
              <button
                onClick={() => remover(a.id, orcamentoId)}
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-0.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
