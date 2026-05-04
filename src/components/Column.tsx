import { Droppable } from '@hello-pangea/dnd'
import { ColunaConfig, Orcamento } from '../types'
import { formatCurrency } from '../utils'
import { Card } from './Card'
import { useStore } from '../store/useStore'

interface ColumnProps {
  config: ColunaConfig
  orcamentos: Orcamento[]
}

const HEADER_COLORS: Record<string, string> = {
  lead:              'border-slate-400',
  qualificacao:      'border-blue-400',
  orcamento_enviado: 'border-amber-400',
  negociacao:        'border-cyan-400',
  objecao:           'border-orange-400',
  aguardando:        'border-purple-400',
  perdido:           'border-red-500',
  vendido:           'border-green-500',
  sucesso:           'border-teal-400',
  lixo:              'border-slate-600',
  sac:               'border-violet-400',
}

export function Column({ config, orcamentos }: ColumnProps) {
  const setModalCriar = useStore((s) => s.setModalCriar)
  const total = orcamentos.reduce((s, c) => s + (c.valor ?? 0), 0)
  const noAddBtn = ['perdido', 'vendido', 'aguardando', 'sucesso', 'lixo', 'sac'].includes(config.id)

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Header */}
      <div className={`bg-card rounded-xl border border-slate-700 border-t-2 ${HEADER_COLORS[config.id]} p-3 mb-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{config.emoji}</span>
            <span className="text-white font-semibold text-sm">{config.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-slate-700 text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">
              {orcamentos.length}
            </span>
            {!noAddBtn && (
              <button
                onClick={() => setModalCriar(true)}
                title="Novo orçamento"
                className="text-slate-400 hover:text-white w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-600 transition-colors text-lg leading-none"
              >
                +
              </button>
            )}
          </div>
        </div>
        {config.showTotal && total > 0 && (
          <p className="text-accent font-bold text-sm mt-1">{formatCurrency(total)}</p>
        )}
      </div>

      {/* Cards */}
      <Droppable droppableId={config.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-24 rounded-xl transition-colors p-1 ${
              snapshot.isDraggingOver ? 'bg-primary/10 ring-1 ring-primary-light/30' : ''
            }`}
          >
            {orcamentos.map((orcamento, i) => (
              <Card key={orcamento.id} orcamento={orcamento} index={i} />
            ))}
            {provided.placeholder}
            {orcamentos.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-slate-600 text-xs text-center py-6 border-2 border-dashed border-slate-700 rounded-lg">
                Nenhum card
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
