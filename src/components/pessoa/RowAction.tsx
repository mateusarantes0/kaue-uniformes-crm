import { type ReactNode } from 'react'

interface Props {
  icon: ReactNode
  label: string
  danger?: boolean
  onClick: () => void
}

export function RowAction({ icon, label, danger, onClick }: Props) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      aria-label={label}
      title={label}
      className={`w-7 h-7 rounded inline-flex items-center justify-center
                  transition-colors duration-[120ms]
                  ${
                    danger
                      ? 'text-red-300 hover:bg-[#243044] hover:text-red-200'
                      : 'text-slate-400 hover:bg-[#243044] hover:text-white'
                  }`}
    >
      {icon}
    </button>
  )
}
