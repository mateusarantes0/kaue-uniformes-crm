import { useState } from 'react'
import { useEmpresaStore } from '../store/useEmpresaStore'
import { SEGMENTO_LABELS, TIPO_CLIENTE_LABELS, PORTE_EMPRESA_LABELS, Segmento, TipoCliente } from '../types'

const SEGMENTO_OPTIONS: { value: Segmento | ''; label: string }[] = [
  { value: '', label: 'Todos os segmentos' },
  ...Object.entries(SEGMENTO_LABELS).map(([v, l]) => ({ value: v as Segmento, label: l })),
]

const TIPO_OPTIONS: { value: TipoCliente | ''; label: string }[] = [
  { value: '', label: 'Todos os tipos' },
  ...Object.entries(TIPO_CLIENTE_LABELS).map(([v, l]) => ({ value: v as TipoCliente, label: l })),
]

const TIPO_BADGE: Record<TipoCliente, string> = {
  ativo:       'bg-green-900/40 text-green-400',
  inativo:     'bg-slate-700 text-slate-400',
  inadimplente:'bg-red-900/40 text-red-400',
  inoperante:  'bg-orange-900/40 text-orange-400',
  problematico:'bg-yellow-900/40 text-yellow-400',
}

export function EmpresaList() {
  const empresas = useEmpresaStore((s) => s.empresasFiltradas)
  const deleteEmpresa = useEmpresaStore((s) => s.deleteEmpresa)
  const setModalEditar = useEmpresaStore((s) => s.setModalEditar)
  const setModalCriar = useEmpresaStore((s) => s.setModalCriar)

  const [search, setSearch] = useState('')
  const [segmentoFiltro, setSegmentoFiltro] = useState<Segmento | ''>('')
  const [tipoFiltro, setTipoFiltro] = useState<TipoCliente | ''>('')

  const filtered = empresas.filter((e) => {
    const matchSearch =
      e.nome.toLowerCase().includes(search.toLowerCase()) ||
      (e.cnpj ?? '').includes(search)
    const matchSeg = segmentoFiltro === '' || e.segmento === segmentoFiltro
    const matchTipo = tipoFiltro === '' || e.tipoCliente === tipoFiltro
    return matchSearch && matchSeg && matchTipo
  })

  const handleDelete = (id: string, nome: string) => {
    if (confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) {
      deleteEmpresa(id)
    }
  }

  return (
    <div className="px-4 py-4 flex-1">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Buscar por nome ou CNPJ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-card border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent w-64"
        />
        <select
          value={segmentoFiltro}
          onChange={(e) => setSegmentoFiltro(e.target.value as Segmento | '')}
          className="bg-card border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
        >
          {SEGMENTO_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value as TipoCliente | '')}
          className="bg-card border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
        >
          {TIPO_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="text-xs text-slate-500 ml-auto">{filtered.length} empresa{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="bg-card border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-[#0F172A]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nome</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">CNPJ</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Segmento</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Tipo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden xl:table-cell">Porte</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden xl:table-cell">Cidade/UF</th>
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-500 text-sm">
                  {search || segmentoFiltro || tipoFiltro
                    ? 'Nenhuma empresa encontrada com esses filtros.'
                    : 'Nenhuma empresa cadastrada.'}
                </td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{e.id}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setModalEditar(e)}
                      className="text-white font-medium hover:text-accent transition-colors text-left"
                    >
                      {e.nome}
                    </button>
                    {e.razaoSocial && (
                      <p className="text-slate-500 text-xs">{e.razaoSocial}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs hidden md:table-cell">
                    {e.cnpj ?? <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">
                    {e.segmento ? SEGMENTO_LABELS[e.segmento] : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {e.tipoCliente ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIPO_BADGE[e.tipoCliente]}`}>
                        {TIPO_CLIENTE_LABELS[e.tipoCliente]}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 hidden xl:table-cell">
                    {e.porteEmpresa ? PORTE_EMPRESA_LABELS[e.porteEmpresa] : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden xl:table-cell">
                    {e.cidade && e.uf ? `${e.cidade} / ${e.uf}` : e.cidade ?? e.uf ?? <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setModalEditar(e)}
                        title="Editar"
                        className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(e.id, e.nome)}
                        title="Excluir"
                        className="text-slate-400 hover:text-red-400 p-1 rounded transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Empty state action */}
      {filtered.length === 0 && !search && !segmentoFiltro && !tipoFiltro && (
        <div className="text-center mt-6">
          <button
            onClick={() => setModalCriar(true)}
            className="bg-accent hover:bg-accent-light text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
          >
            + Nova Empresa
          </button>
        </div>
      )}
    </div>
  )
}
