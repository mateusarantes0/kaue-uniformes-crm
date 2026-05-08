import { useState, useEffect, useRef, useCallback } from 'react'
import { stripMask } from '../../utils'

export interface SearchableItem {
  id: string
  nome: string
  subtitle?: string
  telefone?: string
}

export interface SearchableSelectProps {
  selected: SearchableItem[]
  onAdd: (item: SearchableItem) => void
  onRemove: (id: string) => void
  onSearch: (query: string) => SearchableItem[]
  onCreate?: (query: string) => void
  placeholder?: string
  multi?: boolean
}

const WA_SVG = (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
)

function Avatar({ nome }: { nome: string }) {
  return (
    <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
      <span className="text-accent font-semibold text-[11px]">{nome.charAt(0).toUpperCase()}</span>
    </div>
  )
}

function SelectedChip({
  item,
  onRemove,
}: {
  item: SearchableItem
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-2 w-[248px] bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2">
      <Avatar nome={item.nome} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-white font-medium truncate">{item.nome}</p>
        {item.subtitle && (
          <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
        )}
        {item.telefone && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-slate-500 font-mono">{item.telefone}</span>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.open(`https://wa.me/55${stripMask(item.telefone!)}`, '_blank')
              }}
              title="WhatsApp"
              className="text-green-500 hover:text-green-400 transition-colors"
            >
              {WA_SVG}
            </button>
          </div>
        )}
      </div>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onRemove() }}
        className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0 text-base leading-none"
        aria-label={`Remover ${item.nome}`}
      >
        ×
      </button>
    </div>
  )
}

function ResultRow({
  item,
  highlighted,
  onSelect,
}: {
  item: SearchableItem
  highlighted: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onSelect() }}
      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 border-l-2 transition-colors ${
        highlighted
          ? 'border-accent bg-accent/10 text-white'
          : 'border-transparent hover:bg-slate-700/50 text-slate-200'
      }`}
    >
      <Avatar nome={item.nome} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium truncate">{item.nome}</p>
        {item.subtitle && (
          <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
        )}
        {item.telefone && (
          <p className="text-[10px] text-slate-600 font-mono truncate">{item.telefone}</p>
        )}
      </div>
    </button>
  )
}

export function SearchableSelect({
  selected,
  onAdd,
  onRemove,
  onSearch,
  onCreate,
  placeholder = 'Buscar...',
  multi = true,
}: SearchableSelectProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchableItem[]>([])
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const onSearchRef = useRef(onSearch)
  onSearchRef.current = onSearch

  useEffect(() => {
    const id = setTimeout(() => {
      const res = onSearchRef.current(query)
      const selectedIds = selected.map((s) => s.id)
      setResults(res.filter((r) => !selectedIds.includes(r.id)))
      setHighlighted(0)
    }, 200)
    return () => clearTimeout(id)
  }, [query, selected])

  const handleSelect = useCallback(
    (item: SearchableItem) => {
      onAdd(item)
      if (!multi) {
        setQuery('')
        setOpen(false)
      } else {
        setQuery('')
        inputRef.current?.focus()
      }
    },
    [onAdd, multi]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return
    const total = results.length + (onCreate ? 1 : 0)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, total - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlighted < results.length) {
        handleSelect(results[highlighted])
      } else if (onCreate && query.trim()) {
        onCreate(query.trim())
        setQuery('')
        setOpen(false)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const showDropdown = open && (results.length > 0 || (!!onCreate && query.trim().length > 0))

  return (
    <div className="space-y-2">
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <SelectedChip key={item.id} item={item} onRemove={() => onRemove(item.id)} />
          ))}
        </div>
      )}

      {/* Input — hide if single and already selected */}
      {(multi || selected.length === 0) && (
        <div className="relative">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              className="input pl-9"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              autoComplete="off"
            />
          </div>

          {showDropdown && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-[#1a2336] border border-slate-700 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
              {results.map((item, i) => (
                <ResultRow
                  key={item.id}
                  item={item}
                  highlighted={i === highlighted}
                  onSelect={() => handleSelect(item)}
                />
              ))}
              {onCreate && query.trim() && (
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); onCreate(query.trim()); setQuery(''); setOpen(false) }}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 border-l-2 transition-colors text-[13px] ${
                    highlighted === results.length
                      ? 'border-accent bg-accent/10 text-white'
                      : 'border-transparent text-slate-400 hover:bg-slate-700/50'
                  }`}
                >
                  <span className="text-accent font-bold">+</span>
                  Criar &ldquo;{query.trim()}&rdquo;
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
