import { formatDate } from '../../utils'

interface Props {
  label: string
  value?: string
  accent?: boolean
  isText?: boolean
}

export function DateRow({ label, value, accent, isText }: Props) {
  if (!value) return null
  const display = isText ? value : formatDate(value)
  return (
    <div className="flex items-baseline justify-between py-2 border-b border-[#1f2937] last:border-b-0 gap-4">
      <span className="text-[13px] text-slate-400 flex-shrink-0">{label}</span>
      <span className={`text-[13px] text-right ${isText ? '' : 'font-mono'} ${accent ? 'text-orange-300' : 'text-white'}`}>
        {display}
      </span>
    </div>
  )
}
