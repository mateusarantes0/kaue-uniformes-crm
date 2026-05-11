import { useMemo } from 'react'
import { useOrcamentoStore } from '../store/useOrcamentoStore'
import { useAuthStore } from '../store/useAuthStore'
import { formatCurrency } from '../utils'

export function AdminDashboard() {
  const orcamentos = useOrcamentoStore((s) => s.orcamentos)
  const allUsers = useAuthStore((s) => s.users)
  const employees = useMemo(() => allUsers.filter((u) => u.role !== 'admin'), [allUsers])

  const stats = useMemo(() =>
    employees.map(({ id, name }) => {
      const proprios    = orcamentos.filter((o) => o.responsavelId === id || o.ownerId === id)
      const terminal    = new Set(['perdido', 'vendido', 'sucesso', 'lixo'])
      const ativos      = proprios.filter((o) => !terminal.has(o.coluna))
      const emOrcamento = proprios.filter((o) => o.coluna === 'orcamento_enviado')
      const vendido     = proprios.filter((o) => o.coluna === 'vendido' || o.coluna === 'sucesso')
      const perdido     = proprios.filter((o) => o.coluna === 'perdido' || o.coluna === 'lixo')

      const totalOrcamento = emOrcamento.reduce((s, o) => s + (o.valor ?? 0), 0)
      const totalVendido   = vendido.reduce((s, o) => s + (o.valor ?? 0), 0)

      const totalFinalizados = vendido.length + perdido.length
      const conversao = totalFinalizados > 0
        ? Math.round((vendido.length / totalFinalizados) * 100)
        : 0

      return { name, ativos: ativos.length, totalOrcamento, totalVendido, conversao }
    }),
  [orcamentos, employees])

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
              <Metric label="Ativos"       value={String(s.ativos)}              icon="👤" />
              <Metric label="Orçamento"    value={formatCurrency(s.totalOrcamento)} icon="💼" />
              <Metric label="Vendido"      value={formatCurrency(s.totalVendido)}   icon="✅" accent />
              <Metric label="Conversão"    value={`${s.conversao}%`}              icon="📈" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface MetricProps { label: string; value: string; icon: string; accent?: boolean }

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
