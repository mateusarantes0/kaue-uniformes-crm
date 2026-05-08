import { HistoricoItem } from '../../types'
import { useAuthStore } from '../../store/useAuthStore'
import { formatDateTime } from '../../utils'

interface Props {
  entry: HistoricoItem
  isLast: boolean
}

export function HistoricoEntry({ entry, isLast }: Props) {
  const users = useAuthStore((s) => s.users)
  const usuarioNome = users.find((u) => u.id === entry.usuarioId)?.name ?? entry.usuarioId

  return (
    <div className="relative flex gap-3 pb-4">
      <div className="flex-shrink-0 w-3 flex flex-col items-center">
        <span className="w-[9px] h-[9px] rounded-full bg-accent ring-2 ring-slate-700 mt-1.5 flex-shrink-0" />
        {!isLast && <span className="flex-1 w-px bg-slate-700 mt-1 min-h-[8px]" />}
      </div>
      <div className="flex-1 min-w-0 pb-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-mono text-[11px] text-slate-500">{formatDateTime(entry.data)}</span>
          <span className="text-[11px] text-slate-400">{usuarioNome}</span>
        </div>
        <p className="mt-0.5 text-[13px] text-slate-200">{entry.texto}</p>
      </div>
    </div>
  )
}
