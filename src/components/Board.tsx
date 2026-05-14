import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'
import { useOrcamentoStore } from '../store/useOrcamentoStore'
import { useEmpresaStore } from '../store/useEmpresaStore'
import { useFiltrosStore } from '../store/useFiltrosStore'
import { COLUNAS, Coluna } from '../types'
import { validarMudancaColuna } from '../lib/validacoesEtapa'
import { Column } from './Column'


export function Board() {
  const orcamentos      = useOrcamentoStore((s) => s.orcamentosFiltradosComBusca)
  const allOrcamentos   = useOrcamentoStore((s) => s.orcamentos)
  const moveOrcamento   = useOrcamentoStore((s) => s.moveOrcamento)
  const setPendingMove  = useOrcamentoStore((s) => s.setPendingMove)
  const setPendingCamposFaltantes = useOrcamentoStore((s) => s.setPendingCamposFaltantes)
  const setModalEditar  = useOrcamentoStore((s) => s.setModalEditar)
  const setValidationErrors = useOrcamentoStore((s) => s.setValidationErrors)

  const empresas = useEmpresaStore((s) => s.empresas)

  const mostrarArquivados  = useOrcamentoStore((s) => s.mostrarArquivados)
  const setMostrarArquivados = useOrcamentoStore((s) => s.setMostrarArquivados)

  const busca   = useFiltrosStore((s) => s.busca)
  const update  = useFiltrosStore((s) => s.update)
  const hasFiltros = useFiltrosStore((s) => s.hasFiltros())

  const handleDragEnd = (result: DropResult) => {
    const { draggableId, destination, source } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId) return

    const destColuna = destination.droppableId as Coluna
    const orc = allOrcamentos.find((o) => o.id === draggableId)
    if (!orc) return

    // Validate for non-modal destinations
    const modalDestinos: Coluna[] = ['objecao', 'perdido', 'lixo', 'vendido', 'despacho', 'sucesso']
    if (!modalDestinos.includes(destColuna)) {
      const empresa = orc.empresaId ? empresas.find((e) => e.id === orc.empresaId) : undefined
      const { ok, erros } = validarMudancaColuna(orc, destColuna, empresa)
      if (!ok) {
        setPendingCamposFaltantes({ orcamentoId: draggableId, colunaDestino: destColuna, erros })
        setValidationErrors(erros)
        return
      }
    }

    if (destColuna === 'objecao') {
      setPendingMove({ orcamentoId: draggableId, colunaDestino: 'objecao', motivo: 'objecao' })
    } else if (destColuna === 'perdido') {
      setPendingMove({ orcamentoId: draggableId, colunaDestino: 'perdido', motivo: 'perdido' })
    } else if (destColuna === 'lixo') {
      setPendingMove({ orcamentoId: draggableId, colunaDestino: 'lixo', motivo: 'lixo' })
    } else if (destColuna === 'vendido' || destColuna === 'despacho' || destColuna === 'sucesso') {
      setPendingMove({ orcamentoId: draggableId, colunaDestino: destColuna, motivo: 'ganho' })
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
        <button
          onClick={() => setMostrarArquivados(!mostrarArquivados)}
          className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
            mostrarArquivados
              ? 'border-amber-500/60 text-amber-400 bg-amber-900/20'
              : 'border-slate-700 text-slate-500 hover:text-slate-300 hover:bg-slate-700/40'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8m-9 4v4m4-4v4" />
          </svg>
          {mostrarArquivados ? 'Ocultar arquivados' : 'Arquivados'}
        </button>
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
