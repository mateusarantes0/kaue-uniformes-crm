import { useMemo } from 'react'
import { useOrcamentoStore } from '../store/useOrcamentoStore'
import { formatCurrency, diasDesde } from '../utils'

export function Dashboard() {
  const orcamentos = useOrcamentoStore((s) => s.orcamentosFiltrados)

  const stats = useMemo(() => {
    const terminal = new Set(['perdido', 'vendido', 'sucesso', 'lixo'])
    const ativos       = orcamentos.filter((o) => !terminal.has(o.coluna))
    const emOrcamento  = orcamentos.filter((o) => o.coluna === 'orcamento_enviado')
    const vendido      = orcamentos.filter((o) => o.coluna === 'vendido' || o.coluna === 'sucesso')
    const perdido      = orcamentos.filter((o) => o.coluna === 'perdido' || o.coluna === 'lixo')

    const totalOrcamento = emOrcamento.reduce((s, o) => s + (o.valor ?? 0), 0)
    const totalVendido   = vendido.reduce((s, o) => s + (o.valor ?? 0), 0)

    const totalFinalizados = vendido.length + perdido.length
    const conversao = totalFinalizados > 0 ? Math.round((vendido.length / totalFinalizados) * 100) : 0

    const semInteracao = orcamentos.filter(
      (o) => !terminal.has(o.coluna) && diasDesde(o.ultimoContatoEm ?? o.criadoEm) > 7
    ).length

    return { ativos: ativos.length, totalOrcamento, totalVendido, conversao, semInteracao }
  }, [orcamentos])

  return (
    <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <Metric label="Leads Ativos"        value={String(stats.ativos)}                icon="👤" />
      <Metric label="Em Orçamento"        value={formatCurrency(stats.totalOrcamento)} icon="💼" />
      <Metric label="Vendido"             value={formatCurrency(stats.totalVendido)}   icon="✅" accent />
      <Metric label="Conversão"           value={`${stats.conversao}%`}               icon="📈" />
      {stats.semInteracao > 0 ? (
        <Metric label="+7 dias sem contato" value={String(stats.semInteracao)} icon="⚠️" alert />
      ) : (
        <Metric label="+7 dias sem contato" value="0" icon="✔️" />
      )}
    </div>
  )
}

interface MetricProps { label: string; value: string; icon: string; accent?: boolean; alert?: boolean }

function Metric({ label, value, icon, accent, alert }: MetricProps) {
  return (
    <div className={`bg-card rounded-xl p-3 border ${alert ? 'border-red-500/50 bg-red-950/30' : accent ? 'border-accent/40' : 'border-slate-700'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{icon}</span>
        <span className="text-xs text-slate-400 truncate">{label}</span>
      </div>
      <p className={`text-lg font-bold ${alert ? 'text-red-400' : accent ? 'text-accent' : 'text-white'}`}>{value}</p>
    </div>
  )
}
