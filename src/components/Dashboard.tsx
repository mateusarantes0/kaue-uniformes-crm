import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { formatCurrency, diasDesde } from '../utils'

export function Dashboard() {
  const orcamentos = useStore((s) => s.orcamentosFiltrados)

  const stats = useMemo(() => {
    const terminal = ['perdido', 'vendido', 'sucesso', 'lixo', 'sac']
    const ativos    = orcamentos.filter((c) => !terminal.includes(c.coluna))
    const emOrcamento = orcamentos.filter((c) => c.coluna === 'orcamento_enviado')
    const vendido   = orcamentos.filter((c) => c.coluna === 'vendido' || c.coluna === 'sucesso')
    const perdido   = orcamentos.filter((c) => c.coluna === 'perdido' || c.coluna === 'lixo')

    const totalOrcamento = emOrcamento.reduce((s, c) => s + (c.valor ?? 0), 0)
    const totalVendido   = vendido.reduce((s, c) => s + (c.valor ?? 0), 0)

    const totalFinalizados = vendido.length + perdido.length
    const conversao = totalFinalizados > 0 ? Math.round((vendido.length / totalFinalizados) * 100) : 0

    const semInteracao = orcamentos.filter(
      (c) => !terminal.includes(c.coluna) && diasDesde(c.ultimoContatoEm ?? c.criadoEm) > 7
    ).length

    return { ativos: ativos.length, totalOrcamento, totalVendido, conversao, semInteracao }
  }, [orcamentos])

  return (
    <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <Metric label="Leads Ativos"       value={String(stats.ativos)}               icon="👤" />
      <Metric label="Em Orçamento"       value={formatCurrency(stats.totalOrcamento)} icon="💼" />
      <Metric label="Vendido"            value={formatCurrency(stats.totalVendido)}   icon="✅" accent />
      <Metric label="Conversão"          value={`${stats.conversao}%`}               icon="📈" />
      {stats.semInteracao > 0 ? (
        <Metric label="+7 dias sem contato" value={String(stats.semInteracao)} icon="⚠️" alert />
      ) : (
        <Metric label="+7 dias sem contato" value="0" icon="✔️" />
      )}
    </div>
  )
}

interface MetricProps {
  label: string
  value: string
  icon: string
  accent?: boolean
  alert?: boolean
}

function Metric({ label, value, icon, accent, alert }: MetricProps) {
  return (
    <div
      className={`bg-card rounded-xl p-3 border ${
        alert  ? 'border-red-500/50 bg-red-950/30' :
        accent ? 'border-accent/40' :
                 'border-slate-700'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{icon}</span>
        <span className="text-xs text-slate-400 truncate">{label}</span>
      </div>
      <p className={`text-lg font-bold ${alert ? 'text-red-400' : accent ? 'text-accent' : 'text-white'}`}>
        {value}
      </p>
    </div>
  )
}
