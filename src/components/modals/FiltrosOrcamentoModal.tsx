import { useFiltrosStore } from '../../store/useFiltrosStore'
import { useAuthStore } from '../../store/useAuthStore'
import { Campanha, Coluna, Origem, CAMPANHA_LABELS, COLUNAS, ORIGEM_LABELS } from '../../types'

export function FiltrosOrcamentoModal() {
  const {
    filtrosModalOpen, update, resetFiltros,
    responsaveisIds, colunas, origem, campanhaOfertada, dataInicio, dataFim,
  } = useFiltrosStore()
  const users = useAuthStore((s) => s.users)

  if (!filtrosModalOpen) return null

  const toggleResponsavel = (id: string) =>
    update({ responsaveisIds: responsaveisIds.includes(id) ? responsaveisIds.filter((x) => x !== id) : [...responsaveisIds, id] })

  const toggleColuna = (c: Coluna) =>
    update({ colunas: colunas.includes(c) ? colunas.filter((x) => x !== c) : [...colunas, c] })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(2,6,16,0.72)] animate-kaue-fade"
      onClick={() => update({ filtrosModalOpen: false })}
    >
      <div
        className="bg-card rounded-xl w-full max-w-[800px] max-h-[90vh] overflow-y-auto shadow-xl animate-kaue-rise"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-base font-semibold text-white">Filtros de Orçamento</h2>
          <button
            onClick={() => update({ filtrosModalOpen: false })}
            className="text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Responsável */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Responsável</p>
            <div className="flex flex-wrap gap-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => toggleResponsavel(u.id)}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    responsaveisIds.includes(u.id)
                      ? 'border-amber-500/60 bg-amber-900/20 text-amber-300'
                      : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700/40'
                  }`}
                >
                  {u.name}
                </button>
              ))}
            </div>
          </div>

          {/* Etapa */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Etapa</p>
            <div className="flex flex-wrap gap-2">
              {COLUNAS.map((col) => (
                <button
                  key={col.id}
                  onClick={() => toggleColuna(col.id)}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    colunas.includes(col.id)
                      ? 'border-amber-500/60 bg-amber-900/20 text-amber-300'
                      : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700/40'
                  }`}
                >
                  {col.emoji} {col.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campanha + Origem */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Campanha Ofertada</p>
              <select
                className="input"
                value={campanhaOfertada}
                onChange={(e) => update({ campanhaOfertada: e.target.value as Campanha | '' })}
              >
                <option value="">— Todas —</option>
                {(Object.entries(CAMPANHA_LABELS) as [Campanha, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Origem</p>
              <select
                className="input"
                value={origem}
                onChange={(e) => update({ origem: e.target.value as Origem | '' })}
              >
                <option value="">— Todas —</option>
                {(Object.entries(ORIGEM_LABELS) as [Origem, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Período */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Período de Criação</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">De</label>
                <input
                  className="input"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => update({ dataInicio: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Até</label>
                <input
                  className="input"
                  type="date"
                  value={dataFim}
                  onChange={(e) => update({ dataFim: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
          <button
            onClick={resetFiltros}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Limpar filtros
          </button>
          <button onClick={() => update({ filtrosModalOpen: false })} className="btn-primary">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
