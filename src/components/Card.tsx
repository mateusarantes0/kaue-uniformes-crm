import { Draggable } from '@hello-pangea/dnd'
import { Orcamento, ORIGEM_LABELS, TIPO_OBJECAO_LABELS } from '../types'
import { formatCurrency, diasDesde } from '../utils'
import { useStore } from '../store/useStore'

interface CardProps {
  orcamento: Orcamento
  index: number
}

export function Card({ orcamento, index }: CardProps) {
  const deleteOrcamento = useStore((s) => s.deleteOrcamento)
  const setModalEditar = useStore((s) => s.setModalEditar)

  const dias = diasDesde(orcamento.ultimoContatoEm ?? orcamento.criadoEm)
  const oldContact = dias > 7

  const handleDelete = () => {
    if (confirm(`Excluir "${orcamento.nome}"? Esta ação não pode ser desfeita.`)) {
      deleteOrcamento(orcamento.id)
    }
  }

  return (
    <Draggable draggableId={orcamento.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-card border-l-4 border-l-slate-600 rounded-lg p-3 mb-2 cursor-grab active:cursor-grabbing transition-shadow ${
            snapshot.isDragging ? 'shadow-2xl ring-1 ring-primary-light/50' : 'hover:shadow-lg'
          }`}
        >
          {/* Top row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-white font-semibold text-sm leading-tight truncate">{orcamento.nome}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => setModalEditar(orcamento)} title="Editar" className="text-slate-400 hover:text-white p-1 rounded transition-colors">
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

          {/* Info */}
          <div className="space-y-1">
            {orcamento.origem && (
              <p className="text-slate-400 text-xs">{ORIGEM_LABELS[orcamento.origem]}</p>
            )}
            {orcamento.valor != null && orcamento.valor > 0 && (
              <p className="text-accent font-semibold text-sm">{formatCurrency(orcamento.valor)}</p>
            )}
            {orcamento.orcamentoEnviadoEm && (
              <p className="text-xs text-slate-500">
                📤 Envio: {new Date(orcamento.orcamentoEnviadoEm + 'T12:00:00').toLocaleDateString('pt-BR')}
              </p>
            )}
            {orcamento.coluna === 'objecao' && orcamento.tipoObjecao && (
              <p className="text-orange-400 text-xs font-medium">
                ⚠️ {TIPO_OBJECAO_LABELS[orcamento.tipoObjecao]}
                {orcamento.observacaoObjecao && <span className="text-slate-500"> — {orcamento.observacaoObjecao}</span>}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end mt-2 pt-2 border-t border-slate-700/50">
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
