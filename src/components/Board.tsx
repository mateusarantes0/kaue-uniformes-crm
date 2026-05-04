import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { useStore } from '../store/useStore'
import { COLUNAS, Coluna } from '../types'
import { Column } from './Column'

export function Board() {
  const orcamentos = useStore((s) => s.orcamentosFiltrados)
  const moveOrcamento = useStore((s) => s.moveOrcamento)
  const setPendingMove = useStore((s) => s.setPendingMove)

  const handleDragEnd = (result: DropResult) => {
    const { draggableId, destination, source } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId) return

    const destColuna = destination.droppableId as Coluna

    if (destColuna === 'objecao') {
      const orcamento = orcamentos.find((c) => c.id === draggableId)
      if (orcamento) setPendingMove({ orcamentoId: draggableId, colunaDestino: destColuna })
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
