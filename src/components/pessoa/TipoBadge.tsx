import { TipoContato, TIPO_CONTATO_LABELS } from '../../types'

const TIPO_BADGE: Record<TipoContato, { bg: string; fg: string; border: string }> = {
  lead:               { bg: 'bg-blue-900/40',   fg: 'text-blue-300',   border: 'border-blue-700/60' },
  lead_qualificado:   { bg: 'bg-cyan-900/40',   fg: 'text-cyan-300',   border: 'border-cyan-700/60' },
  cliente:            { bg: 'bg-green-900/40',  fg: 'text-green-300',  border: 'border-green-700/60' },
  fornecedor:         { bg: 'bg-purple-900/40', fg: 'text-purple-300', border: 'border-purple-700/60' },
  colaborador:        { bg: 'bg-sky-900/40',    fg: 'text-sky-300',    border: 'border-sky-700/60' },
  transportadora:     { bg: 'bg-indigo-900/40', fg: 'text-indigo-300', border: 'border-indigo-700/60' },
  motorista:          { bg: 'bg-violet-900/40', fg: 'text-violet-300', border: 'border-violet-700/60' },
  candidato_emprego:  { bg: 'bg-yellow-900/40', fg: 'text-yellow-300', border: 'border-yellow-700/60' },
  prestador_servico:  { bg: 'bg-teal-900/40',   fg: 'text-teal-300',   border: 'border-teal-700/60' },
  representante:      { bg: 'bg-orange-900/40', fg: 'text-orange-300', border: 'border-orange-700/60' },
  terceirizado:       { bg: 'bg-pink-900/40',   fg: 'text-pink-300',   border: 'border-pink-700/60' },
  indicador:          { bg: 'bg-lime-900/40',   fg: 'text-lime-300',   border: 'border-lime-700/60' },
  spam:               { bg: 'bg-red-900/40',    fg: 'text-red-300',    border: 'border-red-700/60' },
  outros:             { bg: 'bg-slate-700/40',  fg: 'text-slate-300',  border: 'border-slate-600' },
}

interface Props {
  tipo?: TipoContato
}

export function TipoBadge({ tipo }: Props) {
  if (!tipo) return <span className="text-slate-500 text-[12px]">—</span>
  const cfg = TIPO_BADGE[tipo]
  return (
    <span
      className={`inline-block px-2.5 py-[3px] text-[12px] font-medium leading-[1.4]
                  whitespace-nowrap rounded-md border ${cfg.bg} ${cfg.fg} ${cfg.border}`}
    >
      {TIPO_CONTATO_LABELS[tipo]}
    </span>
  )
}
