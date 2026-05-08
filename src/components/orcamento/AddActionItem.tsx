import { useState } from 'react'

interface Props {
  onAdd: (texto: string) => void
}

export function AddActionItem({ onAdd }: Props) {
  const [adding, setAdding] = useState(false)
  const [text, setText] = useState('')

  const commit = () => {
    if (text.trim()) onAdd(text.trim())
    setText('')
    setAdding(false)
  }

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="mt-2 w-full py-2.5 rounded-lg border border-dashed border-slate-600 text-slate-400
                   text-[13px] hover:border-slate-500 hover:text-white transition-colors
                   flex items-center justify-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
        </svg>
        Adicionar item
      </button>
    )
  }

  return (
    <input
      autoFocus
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit()
        if (e.key === 'Escape') { setText(''); setAdding(false) }
      }}
      placeholder="Digite o item de ação e pressione Enter..."
      className="input mt-2"
    />
  )
}
