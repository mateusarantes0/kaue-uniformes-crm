import { Draggable } from '@hello-pangea/dnd'
import { Orcamento, TIPO_OBJECAO_LABELS, COLUNA_BADGE, COLUNA_LABELS } from '../types'
import { formatCurrency, diasDesde, stripMask } from '../utils'
import { useOrcamentoStore } from '../store/useOrcamentoStore'
import { useEmpresaStore } from '../store/useEmpresaStore'
import { usePessoaStore } from '../store/usePessoaStore'
import { useAuthStore } from '../store/useAuthStore'
import { calcularStatusCard } from '../lib/statusCard'

interface CardProps {
  orcamento: Orcamento
  index: number
}

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

export function Card({ orcamento: o, index }: CardProps) {
  const deleteOrcamento   = useOrcamentoStore((s) => s.deleteOrcamento)
  const setModalEditar    = useOrcamentoStore((s) => s.setModalEditar)
  const setModalDetalheId = useOrcamentoStore((s) => s.setModalDetalheId)
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin')

  const empresa = useEmpresaStore((s) =>
    o.empresaId ? s.empresas.find((e) => e.id === o.empresaId) : undefined
  )
  const contatos = usePessoaStore((s) =>
    s.pessoas.filter((p) => o.contatosIds.includes(p.id))
  )
  const primeiroContato = contatos[0]

  const dias = diasDesde(o.ultimoContatoEm ?? o.criadoEm)
  const oldContact = dias > 7
  const itensPendentes = o.itensAcao.filter((i) => !i.concluido).length
  const statusCard = calcularStatusCard(o)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Excluir "${o.nome}"? Esta ação não pode ser desfeita.`)) {
      deleteOrcamento(o.id)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setModalEditar(o)
  }

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(`https://wa.me/55${stripMask(primeiroContato.telefone!)}`, '_blank')
  }

  const etiquetas = primeiroContato?.etiquetas ?? []

  return (
    <Draggable draggableId={o.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => setModalDetalheId(o.id)}
          className={`rounded-lg p-3 mb-2 cursor-pointer active:cursor-grabbing transition-shadow select-none border-l-4 ${
            statusCard === 'vermelho' ? 'bg-red-500/15 border-red-500' :
            statusCard === 'amarelo' ? 'bg-yellow-500/10 border-yellow-500' :
            'bg-card border-l-slate-600'
          } ${snapshot.isDragging ? 'shadow-2xl ring-1 ring-primary-light/50' : 'hover:shadow-lg'}`}
        >
          {/* Top row */}
          <div className="flex items-start justify-between gap-1 mb-1.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs text-slate-500 font-mono">{o.id}</span>
                {itensPendentes > 0 && (
                  <span className="text-xs bg-amber-900/40 text-amber-400 px-1.5 py-0.5 rounded-full leading-none">
                    {itensPendentes}✓
                  </span>
                )}
              </div>
              {/* Nome do orçamento como título principal */}
              <p className="text-white font-semibold text-base leading-tight truncate">{o.nome}</p>
              {primeiroContato && (
                <p className="text-slate-400 text-xs truncate">
                  {primeiroContato.nome}{empresa ? ` · ${empresa.nome}` : ''}
                </p>
              )}
              {!primeiroContato && empresa && (
                <p className="text-slate-400 text-xs truncate">{empresa.nome}</p>
              )}
            </div>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {primeiroContato?.telefone && (
                <button
                  onClick={handleWhatsApp}
                  title="WhatsApp"
                  className="text-green-500/70 hover:text-green-400 p-1 rounded transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </button>
              )}
              <button onClick={handleEdit} title="Editar" className="text-slate-400 hover:text-white p-1 rounded transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              {isAdmin && (
                <button onClick={handleDelete} title="Excluir" className="text-slate-400 hover:text-red-400 p-1 rounded transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Etiquetas do contato principal */}
          {etiquetas.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {etiquetas.slice(0, 4).map((tag) => {
                const c = tagColor(tag)
                return (
                  <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${c.bg} ${c.text}`}>
                    {tag}
                  </span>
                )
              })}
            </div>
          )}

          {/* Body info */}
          <div className="space-y-1">
            {o.valor != null && o.valor > 0 && (
              <p className="text-accent font-semibold text-sm">{formatCurrency(o.valor)}</p>
            )}
            {o.valorSinal != null && o.valorSinal > 0 && o.valor != null && (
              <p className="font-mono text-xs text-slate-400">
                Restante: <span className="text-amber-300 font-semibold">{formatCurrency(o.valor - o.valorSinal)}</span>
              </p>
            )}
            {o.coluna === 'objecao' && o.tipoObjecao && (
              <p className="text-orange-400 text-xs font-medium">
                ⚠️ {TIPO_OBJECAO_LABELS[o.tipoObjecao]}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${COLUNA_BADGE[o.coluna]}`}>
              {COLUNA_LABELS[o.coluna]}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                oldContact ? 'bg-red-900/50 text-red-400' : 'bg-slate-700 text-slate-400'
              }`}
            >
              {dias === 0 ? 'Hoje' : `${dias}d`}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  )
}
