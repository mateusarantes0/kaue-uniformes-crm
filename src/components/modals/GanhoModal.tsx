import { useState } from 'react'
import toast from 'react-hot-toast'
import { useOrcamentoStore } from '../../store/useOrcamentoStore'
import { Campanha, CAMPANHA_LABELS } from '../../types'
import { ModalShell } from './CreateModal'

export function GanhoModal() {
  const pendingMove = useOrcamentoStore((s) => s.pendingMove)
  const orcamentos = useOrcamentoStore((s) => s.orcamentos)
  const marcarComoGanha = useOrcamentoStore((s) => s.marcarComoGanha)
  const setPendingMove = useOrcamentoStore((s) => s.setPendingMove)

  const [fechouPela, setFechouPela] = useState<Campanha | ''>('')

  if (!pendingMove || pendingMove.motivo !== 'ganho') return null

  const orcamento = orcamentos.find((o) => o.id === pendingMove.orcamentoId)
  if (!orcamento) return null

  const campanhaOptions = Object.entries(CAMPANHA_LABELS) as [Campanha, string][]

  const handleConfirm = async () => {
    await marcarComoGanha(pendingMove.orcamentoId, (fechouPela as Campanha) || undefined)
    toast.success('Orçamento marcado como ganho.')
    setFechouPela('')
    setPendingMove(null)
  }

  const handleCancel = () => {
    setPendingMove(null)
    setFechouPela('')
  }

  return (
    <ModalShell title="Marcar como Ganho" onClose={handleCancel}>
      <div className="space-y-4">
        <p className="text-slate-300 text-sm">
          Qual campanha fechou{' '}
          <span className="text-white font-semibold">{orcamento.nome}</span>?
        </p>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Fechou pela Campanha</label>
          <select
            className="input"
            value={fechouPela}
            onChange={(e) => setFechouPela(e.target.value as Campanha | '')}
            autoFocus
          >
            <option value="">— Nenhuma campanha específica —</option>
            {campanhaOptions.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button onClick={handleCancel} className="btn-ghost">Cancelar</button>
          <button
            onClick={handleConfirm}
            className="bg-green-700 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            🏆 Confirmar Ganho
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
