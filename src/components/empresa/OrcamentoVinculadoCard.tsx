import { Orcamento, COLUNA_LABELS, COLUNA_BADGE_COLORS } from '../../types'
import { formatCurrency } from '../../utils'

interface Props {
  orcamento: Orcamento
  onClick: () => void
}

export function OrcamentoVinculadoCard({ orcamento, onClick }: Props) {
  const colors = COLUNA_BADGE_COLORS[orcamento.coluna]

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 bg-[#0f172a] hover:bg-[#162032] border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-2.5 transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-slate-600">{orcamento.id.slice(0, 8)}</span>
          <p className="text-[13px] text-white font-medium truncate group-hover:text-accent transition-colors">
            {orcamento.nome}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-[1px] rounded ${colors.fg} ${colors.bg}`}>
            {COLUNA_LABELS[orcamento.coluna]}
          </span>
          {orcamento.valor != null && (
            <span className="text-[11px] text-accent font-mono">{formatCurrency(orcamento.valor)}</span>
          )}
        </div>
      </div>
      <svg className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </button>
  )
}
