import { useState } from 'react'
import { usePessoaStore } from '../store/usePessoaStore'
import { useEmpresaStore } from '../store/useEmpresaStore'
import { TIPO_CONTATO_LABELS, CARGO_LABELS, TipoContato } from '../types'
import { stripMask } from '../utils'

const TIPO_OPTIONS: { value: TipoContato | ''; label: string }[] = [
  { value: '', label: 'Todos os tipos' },
  ...Object.entries(TIPO_CONTATO_LABELS).map(([v, l]) => ({ value: v as TipoContato, label: l })),
]

export function PessoaList() {
  const pessoas = usePessoaStore((s) => s.pessoasFiltradas)
  const empresas = useEmpresaStore((s) => s.empresas)
  const deletePessoa = usePessoaStore((s) => s.deletePessoa)
  const setModalEditar = usePessoaStore((s) => s.setModalEditar)
  const setModalCriar = usePessoaStore((s) => s.setModalCriar)

  const [search, setSearch] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<TipoContato | ''>('')

  const filtered = pessoas.filter((p) => {
    const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase())
    const matchTipo = tipoFiltro === '' || p.tipoContato === tipoFiltro
    return matchSearch && matchTipo
  })

  const getEmpresa = (id?: string) =>
    id ? empresas.find((e) => e.id === id)?.nome : undefined

  const handleDelete = (id: string, nome: string) => {
    if (confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) {
      deletePessoa(id)
    }
  }

  return (
    <div className="px-4 py-4 flex-1">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-card border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent w-56"
        />
        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value as TipoContato | '')}
          className="bg-card border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
        >
          {TIPO_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="text-xs text-slate-500 ml-auto">{filtered.length} pessoa{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="bg-card border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-[#0F172A]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nome</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Empresa</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Cargo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Telefone</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Tipo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden xl:table-cell">Cidade/UF</th>
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-500 text-sm">
                  {search || tipoFiltro ? 'Nenhuma pessoa encontrada com esses filtros.' : 'Nenhuma pessoa cadastrada.'}
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const empresa = getEmpresa(p.empresaId)
                return (
                  <tr
                    key={p.id}
                    className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{p.id}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setModalEditar(p)}
                        className="text-white font-medium hover:text-accent transition-colors text-left"
                      >
                        {p.nome}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-400 hidden md:table-cell">
                      {empresa ?? <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">
                      {p.cargo ? CARGO_LABELS[p.cargo] : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {p.telefone ? (
                        <button
                          onClick={() => window.open(`https://wa.me/55${stripMask(p.telefone!)}`, '_blank')}
                          className="text-green-400 hover:text-green-300 transition-colors font-mono text-xs"
                        >
                          {p.telefone}
                        </button>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {p.tipoContato ? (
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                          {TIPO_CONTATO_LABELS[p.tipoContato]}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden xl:table-cell">
                      {p.cidade && p.uf ? `${p.cidade} / ${p.uf}` : p.cidade ?? p.uf ?? <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setModalEditar(p)}
                          title="Editar"
                          className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.nome)}
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
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Empty state action */}
      {filtered.length === 0 && !search && !tipoFiltro && (
        <div className="text-center mt-6">
          <button
            onClick={() => setModalCriar(true)}
            className="bg-accent hover:bg-accent-light text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
          >
            + Nova Pessoa
          </button>
        </div>
      )}
    </div>
  )
}
