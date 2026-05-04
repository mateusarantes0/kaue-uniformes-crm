import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { formatCurrency } from '../utils'

const EMPLOYEES = [
  { id: 'noemi', name: 'Noemi' },
  { id: 'dione', name: 'Dione' },
]

export function AdminDashboard() {
  const orcamentos = useStore((s) => s.orcamentos)

  const stats = useMemo(() =>
    EMPLOYEES.map(({ id, name }) => {
      const proprios    = orcamentos.filter((c) => (c.ownerId ?? 'admin') === id)
      const terminal    = ['perdido', 'vendido', 'sucesso', 'lixo', 'sac']
      const ativos      = proprios.filter((c) => !terminal.includes(c.coluna))
      const emOrcamento = proprios.filter((c) => c.coluna === 'orcamento_enviado')
      const vendido     = proprios.filter((c) => c.coluna === 'vendido' || c.coluna === 'sucesso')
      const perdido     = proprios.filter((c) => c.coluna === 'perdido' || c.coluna === 'lixo')

      const totalOrcamento = emOrcamento.reduce((s, c) => s + (c.valor ?? 0), 0)
      const totalVendido   = vendido.reduce((s, c) => s + (c.valor ?? 0), 0)

      const totalFinalizados = vendido.length + perdido.length
      const conversao = totalFinalizados > 0
        ? Math.round((vendido.length / totalFinalizados) * 100)
        : 0

      return { name, ativos: ativos.length, totalOrcamento, totalVendido, conversao }
    }),
  [orcamentos])

  return (
    <div className="px-4 pt-3 pb-1">
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium">
        Visão por Funcionária
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.name} className="bg-card border border-slate-700 rounded-xl p-4">
            <p className="text-sm font-semibold text-white mb-3">{s.name}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Metric label="Leads Ativos"   value={String(s.ativos)}              icon="👤" />
              <Metric label="Em Orçamento"   value={formatCurrency(s.totalOrcamento)} icon="💼" />
              <Metric label="Vendido"        value={formatCurrency(s.totalVendido)}   icon="✅" accent />
              <Metric label="Conversão"      value={`${s.conversao}%`}              icon="📈" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface MetricProps {
  label: string
  value: string
  icon: string
  accent?: boolean
}

function Metric({ label, value, icon, accent }: MetricProps) {
  return (
    <div className={`bg-[#0F172A] rounded-lg p-2 border ${accent ? 'border-accent/40' : 'border-slate-700/60'}`}>
      <div className="flex items-center gap-1 mb-1">
        <span className="text-sm">{icon}</span>
        <span className="text-xs text-slate-400 truncate">{label}</span>
      </div>
      <p className={`text-base font-bold ${accent ? 'text-accent' : 'text-white'}`}>{value}</p>
    </div>
  )
}
