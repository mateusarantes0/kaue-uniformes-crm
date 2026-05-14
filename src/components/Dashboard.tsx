import { useMemo } from 'react'
import { useOrcamentoStore } from '../store/useOrcamentoStore'
import { useFiltrosStore } from '../store/useFiltrosStore'
import { formatCurrency, diasDesde } from '../utils'
import { Coluna } from '../types'

export function Dashboard() {
  const orcamentos = useOrcamentoStore((s) => s.orcamentosFiltrados)
  const setModalCriar = useOrcamentoStore((s) => s.setModalCriar)
  const setQuickFilterColunas = useFiltrosStore((s) => s.setQuickFilterColunas)
  const setQuickFilterSemContato = useFiltrosStore((s) => s.setQuickFilterSemContato)
  const clearQuickFilter = useFiltrosStore((s) => s.clearQuickFilter)
  const quickFilterColunas = useFiltrosStore((s) => s.quickFilterColunas)
  const quickFilterSemContato = useFiltrosStore((s) => s.quickFilterSemContato)

  const stats = useMemo(() => {
    const terminal = new Set<Coluna>(['perdido', 'vendido', 'sucesso', 'lixo'])
    const leadsAtivos = orcamentos.filter((o) => (o.coluna === 'lead' || o.coluna === 'qualificacao'))
    const emOrcamento = orcamentos.filter((o) => o.coluna === 'orcamento_enviado')
    const vendido = orcamentos.filter((o) => o.coluna === 'vendido' || o.coluna === 'despacho' || o.coluna === 'sucesso')
    const perdido = orcamentos.filter((o) => o.coluna === 'perdido' || o.coluna === 'lixo')

    const totalVendido = vendido.reduce((s, o) => s + (o.valor ?? 0), 0)
    const totalFinalizados = vendido.length + perdido.length
    const conversao = totalFinalizados > 0 ? Math.round((vendido.length / totalFinalizados) * 100) : 0
    const semInteracao = orcamentos.filter(
      (o) => !terminal.has(o.coluna) && diasDesde(o.ultimoContatoEm ?? o.criadoEm) > 7
    ).length

    return { leadsAtivos: leadsAtivos.length, emOrcamento: emOrcamento.length, totalVendido, conversao, semInteracao }
  }, [orcamentos])

  if (orcamentos.length === 0) {
    return (
      <div className="px-4 py-6 flex flex-col items-center gap-3">
        <p className="text-slate-400 text-sm">Comece adicionando seu primeiro orçamento.</p>
        <button onClick={() => setModalCriar(true)} className="btn-primary text-sm px-4 py-2">
          + Novo Orçamento
        </button>
      </div>
    )
  }

  const alertActive = stats.semInteracao > 0
  const isActiveFilter = (colunas: Coluna[]) =>
    quickFilterColunas !== null && colunas.every((c) => quickFilterColunas.includes(c)) && quickFilterColunas.length === colunas.length

  const handleSemContato = () => {
    if (quickFilterSemContato) clearQuickFilter()
    else setQuickFilterSemContato(true)
  }
  const handleColunas = (colunas: Coluna[]) => {
    if (isActiveFilter(colunas)) clearQuickFilter()
    else setQuickFilterColunas(colunas)
  }

  return (
    <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Alert card — first position when > 0 */}
      {alertActive && (
        <MetricCard
          label="+7 dias sem contato"
          value={String(stats.semInteracao)}
          alert
          active={quickFilterSemContato}
          onClick={handleSemContato}
          hint="Clique para ver"
        />
      )}

      {/* Hero: Vendido — 2 cols */}
      <MetricCard
        label="Vendido"
        value={formatCurrency(stats.totalVendido)}
        hero
        accent
        active={isActiveFilter(['vendido', 'despacho', 'sucesso'])}
        onClick={() => handleColunas(['vendido', 'despacho', 'sucesso'])}
        colSpan={2}
      />

      <MetricCard
        label="Leads Ativos"
        value={String(stats.leadsAtivos)}
        active={isActiveFilter(['lead', 'qualificacao'])}
        onClick={() => handleColunas(['lead', 'qualificacao'])}
      />
      <MetricCard
        label="Em Orçamento"
        value={String(stats.emOrcamento)}
        active={isActiveFilter(['orcamento_enviado'])}
        onClick={() => handleColunas(['orcamento_enviado'])}
      />
      <MetricCard
        label="Conversão"
        value={`${stats.conversao}%`}
      />

      {/* Normal sem contato — last when 0 */}
      {!alertActive && (
        <MetricCard
          label="+7 dias sem contato"
          value="0"
        />
      )}
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string
  hero?: boolean
  accent?: boolean
  alert?: boolean
  active?: boolean
  onClick?: () => void
  hint?: string
  colSpan?: number
}

function MetricCard({ label, value, hero, accent, alert, active, onClick, hint, colSpan }: MetricCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-card rounded-xl p-3 border transition-colors ${colSpan === 2 ? 'lg:col-span-2' : ''} ${
        alert
          ? `border-red-500/40 bg-red-950/30 ${onClick ? 'cursor-pointer hover:border-red-500/70' : ''}${active ? ' ring-1 ring-red-500/50' : ''}`
          : accent
          ? `border-accent/40 ${onClick ? 'cursor-pointer hover:border-accent/70' : ''}${active ? ' ring-1 ring-accent/50' : ''}`
          : onClick
          ? `border-slate-700 cursor-pointer hover:border-slate-500${active ? ' ring-1 ring-slate-500/50' : ''}`
          : 'border-slate-700'
      }`}
    >
      <p className="text-[11px] text-slate-400 mb-1 truncate">{label}</p>
      <p className={`font-mono font-bold truncate ${hero ? 'text-[28px]' : 'text-[20px]'} ${
        alert ? 'text-red-400' : accent ? 'text-accent' : 'text-white'
      }`}>
        {value}
      </p>
      {hint && <p className="text-[10px] text-red-300 mt-0.5">{hint}</p>}
    </div>
  )
}
