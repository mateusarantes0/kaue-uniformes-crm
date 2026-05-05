import { formatBRL, maskBRL, parseBRL } from '../../utils'

interface Props {
  value: number | undefined
  onChange: (value: number | undefined) => void
  placeholder?: string
  className?: string
}

export function CurrencyInput({ value, onChange, placeholder, className }: Props) {
  const display = value != null ? formatBRL(value) : ''

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskBRL(e.target.value)
    if (!masked) {
      onChange(undefined)
      return
    }
    onChange(parseBRL(masked))
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
        R$
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder={placeholder ?? '0,00'}
        className={`input pl-10 ${className ?? ''}`}
      />
    </div>
  )
}
