import { Pessoa, CARGO_LABELS } from '../../types'
import { stripMask } from '../../utils'

function tagColor(s: string): { bg: string; text: string } {
  let hash = 0
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash)
  const palette = [
    { bg: 'bg-blue-900/60', text: 'text-blue-300' },
    { bg: 'bg-green-900/60', text: 'text-green-300' },
    { bg: 'bg-purple-900/60', text: 'text-purple-300' },
    { bg: 'bg-amber-900/60', text: 'text-amber-300' },
    { bg: 'bg-pink-900/60', text: 'text-pink-300' },
    { bg: 'bg-teal-900/60', text: 'text-teal-300' },
    { bg: 'bg-orange-900/60', text: 'text-orange-300' },
    { bg: 'bg-cyan-900/60', text: 'text-cyan-300' },
  ]
  return palette[Math.abs(hash) % palette.length]
}

const WA_PATH =
  'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z'

interface Props {
  contato: Pessoa
  onAbrirContato: (id: string) => void
}

export function ContactCard({ contato, onAbrirContato }: Props) {
  return (
    <div className="bg-[#0f172a] border border-slate-700 rounded-xl p-3 mb-2">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-white truncate">{contato.nome}</p>
          <p className="text-[12px] text-slate-400">
            {contato.cargo ? CARGO_LABELS[contato.cargo] : '—'}
          </p>
          {contato.etiquetas && contato.etiquetas.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {contato.etiquetas.slice(0, 5).map((tag) => {
                const c = tagColor(tag)
                return (
                  <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${c.bg} ${c.text}`}>
                    {tag}
                  </span>
                )
              })}
            </div>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onAbrirContato(contato.id) }}
          className="p-1.5 rounded text-slate-400 hover:bg-[#243044] hover:text-white transition-colors flex-shrink-0"
          aria-label="Abrir contato"
          title="Abrir contato"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>
      {contato.telefone && (
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="font-mono text-[13px] text-slate-300 truncate">{contato.telefone}</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.open(`https://wa.me/55${stripMask(contato.telefone!)}`, '_blank')
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#22c55e] hover:bg-[#16a34a]
                       text-[#06231a] text-[12px] font-semibold transition-colors flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d={WA_PATH} />
            </svg>
            WhatsApp
          </button>
        </div>
      )}
    </div>
  )
}
