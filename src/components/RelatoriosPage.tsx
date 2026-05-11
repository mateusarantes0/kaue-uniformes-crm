import { AdminDashboard } from './AdminDashboard'
import { useFiltrosStore } from '../store/useFiltrosStore'

export function RelatoriosPage() {
  const hasFiltros = useFiltrosStore((s) => s.hasFiltros())
  const update = useFiltrosStore((s) => s.update)

  return (
    <main className="flex-1 overflow-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Relatórios</h2>
        <button
          onClick={() => update({ filtrosModalOpen: true })}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
            hasFiltros
              ? 'border-amber-500/60 text-amber-400 bg-amber-900/20'
              : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700/40'
          }`}
        >
          Filtros{hasFiltros ? ' •' : ''}
        </button>
      </div>
      <AdminDashboard />
    </main>
  )
}
