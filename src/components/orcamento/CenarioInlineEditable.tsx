import { useState, useEffect } from 'react'

interface Props {
  value?: string
  onChange: (text: string) => void
}

export function CenarioInlineEditable({ value, onChange }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')

  useEffect(() => {
    if (!editing) setDraft(value ?? '')
  }, [value, editing])

  const commit = () => {
    setEditing(false)
    if (draft !== (value ?? '')) onChange(draft)
  }

  if (!editing) {
    return (
      <div
        onClick={() => { setDraft(value ?? ''); setEditing(true) }}
        className="min-h-[110px] p-3 rounded-lg bg-[#0f172a] border border-slate-700
                   hover:border-slate-600 cursor-text text-[14px] text-slate-200
                   leading-relaxed transition-colors whitespace-pre-wrap"
      >
        {value || <span className="text-slate-500">Descreva o cenário do orçamento...</span>}
      </div>
    )
  }

  return (
    <textarea
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') commit()
        if (e.key === 'Escape') { setDraft(value ?? ''); setEditing(false) }
      }}
      className="input min-h-[130px] resize-y leading-relaxed w-full"
    />
  )
}
