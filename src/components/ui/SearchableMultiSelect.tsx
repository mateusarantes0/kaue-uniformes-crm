import { useState, useRef, useEffect } from 'react'

interface Props<T> {
  items: T[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  getId: (item: T) => string
  getLabel: (item: T) => string
  getSubLabel?: (item: T) => string
  placeholder?: string
  single?: boolean
  onCreateNew?: () => void
  renderChip?: (item: T, onRemove: () => void) => React.ReactNode
}

export function SearchableMultiSelect<T>({
  items,
  selectedIds,
  onChange,
  getId,
  getLabel,
  getSubLabel,
  placeholder = 'Buscar...',
  single,
  onCreateNew,
  renderChip,
}: Props<T>) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectedItems = selectedIds
    .map((id) => items.find((item) => getId(item) === id))
    .filter(Boolean) as T[]

  const filtered =
    search.trim().length > 0
      ? items
          .filter(
            (item) =>
              getLabel(item).toLowerCase().includes(search.toLowerCase()) &&
              !selectedIds.includes(getId(item))
          )
          .slice(0, 8)
      : []

  const handleSelect = (item: T) => {
    const id = getId(item)
    if (single) {
      onChange([id])
    } else {
      onChange([...selectedIds, id])
    }
    setSearch('')
    setOpen(false)
  }

  const handleRemove = (id: string) => {
    onChange(selectedIds.filter((sid) => sid !== id))
  }

  const showInput = !single || selectedIds.length === 0

  return (
    <div ref={ref} className="space-y-1.5">
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedItems.map((item) => {
            const id = getId(item)
            if (renderChip) return <div key={id}>{renderChip(item, () => handleRemove(id))}</div>
            return (
              <div
                key={id}
                className="flex items-center gap-1.5 bg-slate-700 border border-slate-600 rounded-lg px-2.5 py-1 text-xs text-white"
              >
                <span>{getLabel(item)}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(id)}
                  className="text-slate-400 hover:text-red-400 transition-colors ml-0.5 leading-none"
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      )}

      {showInput && (
        <div className="relative">
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setOpen(true)
              }}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
            />
            {onCreateNew && (
              <button
                type="button"
                onClick={onCreateNew}
                title="Criar novo"
                className="text-slate-400 hover:text-accent px-2.5 border border-slate-700 rounded-lg text-sm transition-colors flex-shrink-0"
              >
                +
              </button>
            )}
          </div>
          {open && filtered.length > 0 && (
            <div className="absolute z-50 w-full bg-[#1E293B] border border-slate-600 rounded-lg mt-1 max-h-44 overflow-y-auto shadow-xl">
              {filtered.map((item) => (
                <div
                  key={getId(item)}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-700 text-slate-200"
                  onMouseDown={() => handleSelect(item)}
                >
                  <div>{getLabel(item)}</div>
                  {getSubLabel && (
                    <div className="text-xs text-slate-500">{getSubLabel(item)}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
