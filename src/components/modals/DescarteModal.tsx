import { useState } from 'react'
import toast from 'react-hot-toast'
import { useOrcamentoStore } from '../../store/useOrcamentoStore'
import { ModalShell } from './CreateModal'

const MOTIVOS_DESCARTE = [
  { value: 'Engano', label: 'Engano' },
  { value: 'Erro no contato', label: 'Erro no contato' },
  { value: 'Duplicado', label: 'Duplicado' },
  { value: 'Spam', label: 'Spam' },
  { value: 'Sem interesse', label: 'Sem interesse' },
  { value: 'Costureira / fornecedor', label: 'Costureira / fornecedor procurando' },
  { value: 'Outros', label: 'Outros' },
] as const

export function DescarteModal() {
  const pendingMove = useOrcamentoStore((s) => s.pendingMove)
  const orcamentos = useOrcamentoStore((s) => s.orcamentos)
  const updateOrcamento = useOrcamentoStore((s) => s.updateOrcamento)
  const moveOrcamento = useOrcamentoStore((s) => s.moveOrcamento)
  const setPendingMove = useOrcamentoStore((s) => s.setPendingMove)

  const [motivo, setMotivo] = useState<string>(MOTIVOS_DESCARTE[0].value)
  const [obs, setObs] = useState('')
  const [saving, setSaving] = useState(false)

  if (!pendingMove || pendingMove.motivo !== 'lixo') return null

  const orcamento = orcamentos.find((o) => o.id === pendingMove.orcamentoId)
  if (!orcamento) return null

  const handleConfirm = async () => {
    setSaving(true)
    const motivoFinal = motivo + (obs.trim() ? ` — ${obs.trim()}` : '')
    await updateOrcamento(pendingMove.orcamentoId, { motivoDescarte: motivoFinal })
    await moveOrcamento(pendingMove.orcamentoId, 'lixo')
    toast.success('Orçamento descartado.')
    setMotivo(MOTIVOS_DESCARTE[0].value)
    setObs('')
    setSaving(false)
    setPendingMove(null)
  }

  const handleCancel = () => {
    setPendingMove(null)
    setMotivo(MOTIVOS_DESCARTE[0].value)
    setObs('')
  }

  return (
    <ModalShell title="Motivo do Descarte" onClose={handleCancel}>
      <div className="space-y-4">
        <p className="text-slate-300 text-sm">
          Por que descartar{' '}
          <span className="text-white font-semibold">{orcamento.nome}</span>?
        </p>

        <div className="space-y-2">
          {MOTIVOS_DESCARTE.map((m) => (
            <label
              key={m.value}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                motivo === m.value
                  ? 'border-slate-500 bg-slate-700/50 text-white'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              <input
                type="radio"
                name="motivo"
                value={m.value}
                checked={motivo === m.value}
                onChange={() => setMotivo(m.value)}
                className="accent-slate-400"
              />
              <span className="text-sm">{m.label}</span>
            </label>
          ))}
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Observação (opcional)</label>
          <textarea
            className="input resize-none"
            rows={2}
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Detalhe se necessário..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button onClick={handleCancel} className="btn-ghost" disabled={saving}>Cancelar</button>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="bg-slate-600 hover:bg-slate-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            🗑️ Confirmar Descarte
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
