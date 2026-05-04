import { useState } from 'react'
import toast from 'react-hot-toast'
import { useOrcamentoStore } from '../../store/useOrcamentoStore'
import { TipoObjecao, TIPO_OBJECAO_LABELS } from '../../types'
import { ModalShell } from './CreateModal'

export function ObjecaoModal() {
  const pendingMove = useOrcamentoStore((s) => s.pendingMove)
  const orcamentos = useOrcamentoStore((s) => s.orcamentos)
  const moveOrcamento = useOrcamentoStore((s) => s.moveOrcamento)
  const marcarComoPerdida = useOrcamentoStore((s) => s.marcarComoPerdida)
  const setPendingMove = useOrcamentoStore((s) => s.setPendingMove)

  const [tipo, setTipo] = useState<TipoObjecao>('preco')
  const [observacao, setObservacao] = useState('')

  if (!pendingMove) return null

  const orcamento = orcamentos.find((o) => o.id === pendingMove.orcamentoId)
  if (!orcamento) return null

  const isPerdido = pendingMove.motivo === 'perdido'

  const handleConfirm = () => {
    if (isPerdido) {
      marcarComoPerdida(pendingMove.orcamentoId, tipo, observacao || undefined)
      toast('Marcado como Perdido', { icon: '😢' })
    } else {
      moveOrcamento(pendingMove.orcamentoId, 'objecao', tipo, observacao || undefined)
      toast('Objeção registrada', { icon: '⚠️' })
    }
    setTipo('preco')
    setObservacao('')
  }

  const handleCancel = () => {
    setPendingMove(null)
    setTipo('preco')
    setObservacao('')
  }

  return (
    <ModalShell title={isPerdido ? 'Motivo da Perda' : 'Tipo de Objeção'} onClose={handleCancel}>
      <div className="space-y-4">
        <p className="text-slate-300 text-sm">
          {isPerdido ? 'Por que o orçamento ' : 'Qual é a objeção de '}
          <span className="text-white font-semibold">{orcamento.nome}</span>
          {isPerdido ? ' foi perdido?' : '?'}
        </p>

        <div className="space-y-2">
          {(Object.keys(TIPO_OBJECAO_LABELS) as TipoObjecao[]).map((key) => (
            <label
              key={key}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                tipo === key
                  ? 'border-accent bg-accent/10 text-white'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              <input
                type="radio"
                name="tipo"
                value={key}
                checked={tipo === key}
                onChange={() => setTipo(key)}
                className="accent-amber-500"
              />
              <span className="text-sm">{TIPO_OBJECAO_LABELS[key]}</span>
            </label>
          ))}
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Observação (opcional)</label>
          <textarea
            className="input resize-none"
            rows={2}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder={isPerdido ? 'Detalhe o motivo da perda...' : 'Detalhe a objeção...'}
          />
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button onClick={handleCancel} className="btn-ghost">Cancelar</button>
          <button
            onClick={handleConfirm}
            className={`${isPerdido ? 'bg-red-700 hover:bg-red-600' : 'bg-amber-600 hover:bg-amber-500'} text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors`}
          >
            {isPerdido ? '😢 Confirmar Perda' : '⚠️ Registrar Objeção'}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
