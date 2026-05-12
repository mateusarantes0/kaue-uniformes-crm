import { useFiltrosStore, OperadorLogico } from '../../store/useFiltrosStore'
import { useAuthStore } from '../../store/useAuthStore'
import {
  Campanha, Coluna, Origem,
  CAMPANHA_LABELS, COLUNAS, ORIGEM_LABELS,
  TIPO_CLIENTE_LABELS, GRUPO_ESTRATEGICO_LABELS, SEGMENTO_LABELS,
  TipoCliente, GrupoEstrategico, Segmento,
} from '../../types'

const CAMPOS_FILTRO = [
  { value: 'responsavel',      label: 'Responsável' },
  { value: 'coluna',           label: 'Etapa' },
  { value: 'origem',           label: 'Origem' },
  { value: 'campanhaOfertada', label: 'Campanha Ofertada' },
  { value: 'fechouPela',       label: 'Fechou Pela' },
  { value: 'etiquetaPessoa',   label: 'Etiqueta do Contato' },
  { value: 'tipoCliente',      label: 'Tipo de Cliente' },
  { value: 'grupoEstrategico', label: 'Grupo Estratégico' },
  { value: 'segmento',         label: 'Segmento' },
]

function ValorSelect({ campo, valor, onChange }: { campo: string; valor: string; onChange: (v: string) => void }) {
  const users = useAuthStore((s) => s.users)

  if (campo === 'responsavel') {
    return (
      <select className="input text-xs py-1" value={valor} onChange={(e) => onChange(e.target.value)}>
        <option value="">— Selecionar —</option>
        {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
      </select>
    )
  }
  if (campo === 'coluna') {
    return (
      <select className="input text-xs py-1" value={valor} onChange={(e) => onChange(e.target.value)}>
        <option value="">— Selecionar —</option>
        {COLUNAS.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
      </select>
    )
  }
  if (campo === 'origem') {
    return (
      <select className="input text-xs py-1" value={valor} onChange={(e) => onChange(e.target.value)}>
        <option value="">— Selecionar —</option>
        {(Object.entries(ORIGEM_LABELS) as [Origem, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    )
  }
  if (campo === 'campanhaOfertada' || campo === 'fechouPela') {
    return (
      <select className="input text-xs py-1" value={valor} onChange={(e) => onChange(e.target.value)}>
        <option value="">— Selecionar —</option>
        {(Object.entries(CAMPANHA_LABELS) as [Campanha, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    )
  }
  if (campo === 'tipoCliente') {
    return (
      <select className="input text-xs py-1" value={valor} onChange={(e) => onChange(e.target.value)}>
        <option value="">— Selecionar —</option>
        {(Object.entries(TIPO_CLIENTE_LABELS) as [TipoCliente, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    )
  }
  if (campo === 'grupoEstrategico') {
    return (
      <select className="input text-xs py-1" value={valor} onChange={(e) => onChange(e.target.value)}>
        <option value="">— Selecionar —</option>
        {(Object.entries(GRUPO_ESTRATEGICO_LABELS) as [GrupoEstrategico, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    )
  }
  if (campo === 'segmento') {
    return (
      <select className="input text-xs py-1" value={valor} onChange={(e) => onChange(e.target.value)}>
        <option value="">— Selecionar —</option>
        {(Object.entries(SEGMENTO_LABELS) as [Segmento, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    )
  }
  // etiquetaPessoa: text input
  return (
    <input
      className="input text-xs py-1"
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Texto da etiqueta..."
    />
  )
}

export function FiltrosOrcamentoModal() {
  const {
    filtrosModalOpen, update, resetFiltros,
    busca, operadorRaiz, grupos, dataInicio, dataFim,
    addGrupo, removeGrupo, setGrupoOperador,
    addCondicao, removeCondicao, updateCondicao,
  } = useFiltrosStore()

  if (!filtrosModalOpen) return null

  const hasFiltros = useFiltrosStore.getState().hasFiltros()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(2,6,16,0.72)] animate-kaue-fade"
      onClick={() => update({ filtrosModalOpen: false })}
    >
      <div
        className="bg-card rounded-xl w-full max-w-[860px] max-h-[90vh] overflow-y-auto shadow-xl animate-kaue-rise"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-base font-semibold text-white">Filtros</h2>
          <button
            onClick={() => update({ filtrosModalOpen: false })}
            className="text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Busca rápida */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Busca</p>
            <input
              className="input text-sm"
              placeholder="Buscar por nome do orçamento..."
              value={busca}
              onChange={(e) => update({ busca: e.target.value })}
            />
          </div>

          {/* Grupos de condições */}
          {grupos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Condições</p>
                {grupos.length > 1 && (
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    grupos combinados por
                    <button
                      onClick={() => update({ operadorRaiz: operadorRaiz === 'AND' ? 'OR' : 'AND' })}
                      className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-amber-300 font-mono transition-colors"
                    >
                      {operadorRaiz}
                    </button>
                  </div>
                )}
              </div>

              {grupos.map((grupo, gi) => (
                <div key={grupo.id} className="border border-slate-700 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      Grupo {gi + 1} — combinar por
                      <button
                        onClick={() => setGrupoOperador(grupo.id, grupo.operador === 'AND' ? 'OR' : 'AND')}
                        className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-amber-300 font-mono transition-colors"
                      >
                        {grupo.operador}
                      </button>
                    </div>
                    <button
                      onClick={() => removeGrupo(grupo.id)}
                      className="text-slate-500 hover:text-red-400 text-xs transition-colors"
                    >
                      Remover grupo
                    </button>
                  </div>

                  {grupo.condicoes.map((cond) => (
                    <div key={cond.id} className="flex items-center gap-2">
                      {/* Campo */}
                      <select
                        className="input text-xs py-1 w-44 flex-shrink-0"
                        value={cond.campo}
                        onChange={(e) => updateCondicao(grupo.id, cond.id, { campo: e.target.value, valor: '' })}
                      >
                        {CAMPOS_FILTRO.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                      <span className="text-xs text-slate-500 flex-shrink-0">é</span>
                      {/* Valor */}
                      <div className="flex-1 min-w-0">
                        <ValorSelect
                          campo={cond.campo}
                          valor={cond.valor}
                          onChange={(v) => updateCondicao(grupo.id, cond.id, { valor: v })}
                        />
                      </div>
                      {/* Remover condição */}
                      <button
                        onClick={() => removeCondicao(grupo.id, cond.id)}
                        className="text-slate-500 hover:text-red-400 text-sm leading-none flex-shrink-0 transition-colors px-1"
                        disabled={grupo.condicoes.length === 1}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addCondicao(grupo.id)}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    + Condição
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={addGrupo}
            className="text-xs text-slate-400 hover:text-white border border-dashed border-slate-600 hover:border-slate-400 rounded-lg px-3 py-2 w-full transition-colors"
          >
            + Grupo de condições
          </button>

          {/* Período */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Período de Criação</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">De</label>
                <input className="input" type="date" value={dataInicio} onChange={(e) => update({ dataInicio: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Até</label>
                <input className="input" type="date" value={dataFim} onChange={(e) => update({ dataFim: e.target.value })} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
          <button
            onClick={resetFiltros}
            className={`text-sm transition-colors ${hasFiltros ? 'text-slate-300 hover:text-white' : 'text-slate-500'}`}
            disabled={!hasFiltros}
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
