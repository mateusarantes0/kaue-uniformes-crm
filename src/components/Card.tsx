import { Draggable } from '@hello-pangea/dnd'
import { Cliente, ORIGEM_LABELS, TIPO_OBJECAO_LABELS, ETIQUETA_CONFIG } from '../types'
import { formatCurrency, diasDesde, stripMask } from '../utils'
import { useStore } from '../store/useStore'

interface CardProps {
  cliente: Cliente
  index: number
}

const BORDER_COLOR: Record<string, string> = {
  alta:  'border-l-red-500',
  media: 'border-l-yellow-400',
  baixa: 'border-l-green-500',
}

const PRIORITY_DOT: Record<string, string> = {
  alta:  'bg-red-500',
  media: 'bg-yellow-400',
  baixa: 'bg-green-500',
}

export function Card({ cliente, index }: CardProps) {
  const deleteCliente = useStore((s) => s.deleteCliente)
  const setModalEditar = useStore((s) => s.setModalEditar)

  const dias = diasDesde(cliente.ultimaInteracao)
  const oldContact = dias > 7

  const handleWhatsApp = () => {
    const num = stripMask(cliente.whatsapp)
    window.open(`https://wa.me/55${num}`, '_blank')
  }

  const handleDelete = () => {
    if (confirm(`Excluir "${cliente.nome}"? Esta ação não pode ser desfeita.`)) {
      deleteCliente(cliente.id)
    }
  }

  const etiquetaCfg = cliente.etiqueta ? ETIQUETA_CONFIG[cliente.etiqueta] : null

  return (
    <Draggable draggableId={cliente.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-card border-l-4 ${BORDER_COLOR[cliente.prioridade]} rounded-lg p-3 mb-2 cursor-grab active:cursor-grabbing transition-shadow ${
            snapshot.isDragging ? 'shadow-2xl ring-1 ring-primary-light/50' : 'hover:shadow-lg'
          }`}
        >
          {/* Top row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[cliente.prioridade]}`} />
              <h3 className="text-white font-semibold text-sm leading-tight truncate">{cliente.nome}</h3>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={handleWhatsApp} title="Abrir WhatsApp" className="text-green-400 hover:text-green-300 p-1 rounded transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </button>
              <button onClick={() => setModalEditar(cliente)} title="Editar" className="text-slate-400 hover:text-white p-1 rounded transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button onClick={handleDelete} title="Excluir" className="text-slate-400 hover:text-red-400 p-1 rounded transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Etiqueta */}
          {etiquetaCfg && (
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border mb-2 ${etiquetaCfg.bg} ${etiquetaCfg.color}`}>
              {etiquetaCfg.label}
            </span>
          )}

          {/* Info */}
          <div className="space-y-1">
            <p className="text-slate-400 text-xs">{ORIGEM_LABELS[cliente.origem]} · {cliente.responsavel}</p>
            {cliente.indicadoPor && (
              <p className="text-slate-500 text-xs">Indicado por: {cliente.indicadoPor}</p>
            )}
            {cliente.tipoUniforme && (
              <p className="text-slate-300 text-xs truncate">
                👕 {cliente.tipoUniforme}{cliente.qtdPecas ? ` (${cliente.qtdPecas} pçs)` : ''}
              </p>
            )}
            {cliente.valorEstimado != null && cliente.valorEstimado > 0 && (
              <p className="text-accent font-semibold text-sm">{formatCurrency(cliente.valorEstimado)}</p>
            )}
            {/* Datas de orçamento */}
            {(cliente.dataLancamentoSistema || cliente.dataEnvioOrcamento) && (
              <div className="text-xs text-slate-500 space-y-0.5 pt-1">
                {cliente.dataLancamentoSistema && (
                  <p>📅 Lançamento: {new Date(cliente.dataLancamentoSistema + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                )}
                {cliente.dataEnvioOrcamento && (
                  <p>📤 Envio: {new Date(cliente.dataEnvioOrcamento + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                )}
              </div>
            )}
            {/* Objeção */}
            {cliente.coluna === 'objecao' && cliente.tipoObjecao && (
              <p className="text-orange-400 text-xs font-medium">
                ⚠️ {TIPO_OBJECAO_LABELS[cliente.tipoObjecao]}
                {cliente.observacaoObjecao && <span className="text-slate-500"> — {cliente.observacaoObjecao}</span>}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
            <span className="text-slate-500 text-xs">{cliente.whatsapp}</span>
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
