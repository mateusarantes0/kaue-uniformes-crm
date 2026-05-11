import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { useOrcamentoStore } from '../store/useOrcamentoStore'
import { useFiltrosStore } from '../store/useFiltrosStore'
import { COLUNAS, Coluna } from '../types'
import { Column } from './Column'

export function Board() {
  const orcamentos    = useOrcamentoStore((s) => s.orcamentosFiltradosComBusca)
  const moveOrcamento = useOrcamentoStore((s) => s.moveOrcamento)
  const marcarComoGanha = useOrcamentoStore((s) => s.marcarComoGanha)
  const setPendingMove  = useOrcamentoStore((s) => s.setPendingMove)

  const busca   = useFiltrosStore((s) => s.busca)
  const update  = useFiltrosStore((s) => s.update)
  const hasFiltros = useFiltrosStore((s) => s.hasFiltros())

  const handleDragEnd = (result: DropResult) => {
    const { draggableId, destination, source } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId) return

    const destColuna = destination.droppableId as Coluna

    if (destColuna === 'objecao') {
      setPendingMove({ orcamentoId: draggableId, colunaDestino: 'objecao', motivo: 'objecao' })
    } else if (destColuna === 'perdido') {
      setPendingMove({ orcamentoId: draggableId, colunaDestino: 'perdido', motivo: 'perdido' })
    } else if (destColuna === 'vendido') {
      marcarComoGanha(draggableId)
    } else {
      moveOrcamento(draggableId, destColuna)
    }
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-700/50">
        <input
          className="input max-w-xs text-sm h-8"
          placeholder="Buscar orçamento..."
          value={busca}
          onChange={(e) => update({ busca: e.target.value })}
        />
        <button
          onClick={() => update({ filtrosModalOpen: true })}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
            hasFiltros
              ? 'border-amber-500/60 text-amber-400 bg-amber-900/20'
              : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700/40'
          }`}
        >
          Filtros{hasFiltros ? ' •' : ''}
        </button>
        {(busca || hasFiltros) && (
          <button
            onClick={() => update({ busca: '' })}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {busca ? 'Limpar busca' : ''}
          </button>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 px-4 pb-6 overflow-x-auto min-h-0">
          {COLUNAS.map((config) => {
            const cards = orcamentos.filter((c) => c.coluna === config.id)
            return <Column key={config.id} config={config} orcamentos={cards} />
          })}
        </div>
      </DragDropContext>
    </>
  )
}
