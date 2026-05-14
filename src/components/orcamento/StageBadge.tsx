import { Coluna, COLUNA_LABELS } from '../../types'

const COLORS: Record<Coluna, { fg: string; bg: string; dot: string }> = {
  lead:              { fg: 'text-slate-300',   bg: 'bg-slate-700/40',  dot: 'bg-slate-300' },
  qualificacao:      { fg: 'text-cyan-300',    bg: 'bg-cyan-500/15',   dot: 'bg-cyan-300' },
  orcamento_enviado: { fg: 'text-amber-300',   bg: 'bg-amber-500/15',  dot: 'bg-amber-300' },
  negociacao:        { fg: 'text-violet-300',  bg: 'bg-violet-500/20', dot: 'bg-violet-300' },
  objecao:           { fg: 'text-orange-300',  bg: 'bg-orange-500/15', dot: 'bg-orange-300' },
  aguardando:        { fg: 'text-yellow-300',  bg: 'bg-yellow-500/15', dot: 'bg-yellow-300' },
  vendido:           { fg: 'text-green-400',   bg: 'bg-green-500/20',  dot: 'bg-green-400' },
  despacho:          { fg: 'text-blue-300',    bg: 'bg-blue-500/20',   dot: 'bg-blue-300' },
  sucesso:           { fg: 'text-emerald-300', bg: 'bg-emerald-500/20',dot: 'bg-emerald-300' },
  perdido:           { fg: 'text-red-300',     bg: 'bg-red-500/20',    dot: 'bg-red-300' },
  lixo:              { fg: 'text-slate-500',   bg: 'bg-slate-700/30',  dot: 'bg-slate-500' },
}

interface Props { coluna: Coluna }

export function StageBadge({ coluna }: Props) {
  const cfg = COLORS[coluna]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium ${cfg.bg} ${cfg.fg}`}>
      <span className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ${cfg.dot}`} />
      {COLUNA_LABELS[coluna]}
    </span>
  )
}
