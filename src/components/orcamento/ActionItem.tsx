import { ItemAcao } from '../../types'

interface Props {
  item: ItemAcao
  onToggle: (itemId: string) => void
  onDelete: (itemId: string) => void
}

export function ActionItem({ item, onToggle, onDelete }: Props) {
  return (
    <div className="group flex items-start gap-3 py-2.5 border-b border-[#1f2937] last:border-b-0">
      <button
        onClick={() => onToggle(item.id)}
        role="checkbox"
        aria-checked={item.concluido}
        className={`mt-0.5 w-[18px] h-[18px] rounded border-2 flex items-center justify-center
                    flex-shrink-0 transition-colors ${
                      item.concluido
                        ? 'bg-green-500 border-green-500'
                        : 'border-slate-600 hover:border-slate-400'
                    }`}
      >
        {item.concluido && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <p className={`flex-1 text-[14px] leading-snug ${
        item.concluido ? 'text-slate-500 line-through' : 'text-slate-200'
      }`}>
        {item.texto}
      </p>
      <button
        onClick={() => onDelete(item.id)}
        aria-label="Excluir item"
        title="Excluir item"
        className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400
                   hover:bg-[#243044] hover:text-red-300 transition-all flex-shrink-0"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}
