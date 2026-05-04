import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { useOrcamentoStore } from '../store/useOrcamentoStore'
import { COLUNAS, Coluna } from '../types'
import { Column } from './Column'

export function Board() {
  const orcamentos = useOrcamentoStore((s) => s.orcamentosFiltrados)
  const moveOrcamento = useOrcamentoStore((s) => s.moveOrcamento)
  const marcarComoGanha = useOrcamentoStore((s) => s.marcarComoGanha)
  const setPendingMove = useOrcamentoStore((s) => s.setPendingMove)

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
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 px-4 pb-6 overflow-x-auto min-h-0">
        {COLUNAS.map((config) => {
          const cards = orcamentos.filter((c) => c.coluna === config.id)
          return <Column key={config.id} config={config} orcamentos={cards} />
        })}
      </div>
    </DragDropContext>
  )
}
