import { useMemo, useState } from 'react'
import { usePessoaStore } from '../store/usePessoaStore'
import { useEmpresaStore } from '../store/useEmpresaStore'
import { Cargo, TipoContato, UF, CARGO_LABELS, TIPO_CONTATO_LABELS } from '../types'
import { EmpresaChip } from './pessoa/EmpresaChip'
import { WhatsAppPill } from './pessoa/WhatsAppPill'
import { TipoBadge } from './pessoa/TipoBadge'
import { RowAction } from './pessoa/RowAction'
import { PessoaEmptyState } from './pessoa/PessoaEmptyState'

const PENCIL_ICON = (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const TRASH_ICON = (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const SEARCH_ICON = (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const PLUS_ICON = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
  </svg>
)

const TH_COLS = ['ID', 'Nome', 'Empresa(s)', 'Cargo', 'Telefone', 'Tipo', 'Cidade/UF', '']

export function PessoaList() {
  const pessoas = usePessoaStore((s) => s.pessoasFiltradas)
  const deletePessoa = usePessoaStore((s) => s.deletePessoa)
  const setModalEditar = usePessoaStore((s) => s.setModalEditar)
  const setModalCriar = usePessoaStore((s) => s.setModalCriar)
  const empresas = useEmpresaStore((s) => s.empresas)
  const setEmpresaModalEditar = useEmpresaStore((s) => s.setModalEditar)

  const [search, setSearch] = useState('')
  const [tipo, setTipo] = useState<TipoContato | ''>('')
  const [cargo, setCargo] = useState<Cargo | ''>('')
  const [uf, setUf] = useState<UF | ''>('')

  const cargosDisponiveis = useMemo(
    () => ([...new Set(pessoas.map((p) => p.cargo).filter(Boolean))] as Cargo[]).sort(),
    [pessoas]
  )

  const ufsDisponiveis = useMemo(
    () => ([...new Set(pessoas.map((p) => p.uf).filter(Boolean))] as UF[]).sort(),
    [pessoas]
  )

  const filtered = useMemo(
    () =>
      pessoas.filter((p) => {
        if (search && !p.nome.toLowerCase().includes(search.toLowerCase())) return false
        if (tipo && p.tipoContato !== tipo) return false
        if (cargo && p.cargo !== cargo) return false
        if (uf && p.uf !== uf) return false
        return true
      }),
    [pessoas, search, tipo, cargo, uf]
  )

  const hasActiveFilters = !!(search || tipo || cargo || uf)

  const handleClear = () => {
    setSearch('')
    setTipo('')
    setCargo('')
    setUf('')
  }

  const handleDelete = (id: string, nome: string) => {
    if (confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) {
      deletePessoa(id)
    }
  }

  const handleOpenEmpresa = (empresaId: string) => {
    const empresa = empresas.find((e) => e.id === empresaId)
    if (empresa) setEmpresaModalEditar(empresa)
  }

  return (
    <div className="flex flex-col">
      {/* Page Title */}
      <header className="px-7 pt-6 pb-0 flex items-baseline justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.015em] text-white">Pessoas</h1>
          <p className="mt-1 text-[13px] text-slate-400">
            Leads, clientes, fornecedores e contatos vinculados a empresas.
          </p>
        </div>
        <button
          onClick={() => setModalCriar(true)}
          className="btn-primary flex items-center gap-2"
        >
          {PLUS_ICON}
          Nova pessoa
        </button>
      </header>

      {/* Filter Bar */}
      <div className="mx-7 mt-5 bg-card border border-slate-700 rounded-xl p-4 flex flex-wrap gap-2.5 items-center">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            {SEARCH_ICON}
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome..."
            className="input pl-8 h-9 w-[260px]"
          />
        </div>

        <select
          className="input h-9 w-[170px]"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoContato | '')}
        >
          <option value="">Todos os tipos</option>
          {(Object.entries(TIPO_CONTATO_LABELS) as [TipoContato, string][]).map(([k, l]) => (
            <option key={k} value={k}>{l}</option>
          ))}
        </select>

        <select
          className="input h-9 w-[180px]"
          value={cargo}
          onChange={(e) => setCargo(e.target.value as Cargo | '')}
        >
          <option value="">Todos os cargos</option>
          {cargosDisponiveis.map((c) => (
            <option key={c} value={c}>{CARGO_LABELS[c]}</option>
          ))}
        </select>

        <select
          className="input h-9 w-[130px]"
          value={uf}
          onChange={(e) => setUf(e.target.value as UF | '')}
        >
          <option value="">Todas as UFs</option>
          {ufsDisponiveis.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>

        <button
          onClick={handleClear}
          disabled={!hasActiveFilters}
          className="btn-ghost h-9 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Limpar filtros
        </button>

        <div className="ml-auto text-[13px] text-slate-400">
          <span className="font-mono text-white font-semibold">{filtered.length}</span>
          {' '}{filtered.length === 1 ? 'pessoa' : 'pessoas'}
        </div>
      </div>

      {/* Table Card */}
      <div className="mx-7 mb-7 mt-4 bg-card border border-slate-700 rounded-xl overflow-hidden">
        {pessoas.length === 0 ? (
          <PessoaEmptyState />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16 px-5">
            <p className="text-slate-400 text-sm">Nenhuma pessoa encontrada com esses filtros.</p>
            <button onClick={handleClear} className="btn-ghost mt-3 text-sm">
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse">
              <thead className="bg-[#1a2336] border-b border-slate-700">
                <tr>
                  {TH_COLS.map((th, i) => (
                    <th
                      key={i}
                      className={`py-3 px-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 whitespace-nowrap ${
                        i === TH_COLS.length - 1 ? 'text-right' : 'text-left'
                      }`}
                    >
                      {th}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((pessoa, idx) => (
                  <tr
                    key={pessoa.id}
                    onClick={() => setModalEditar(pessoa)}
                    className={`cursor-pointer hover:bg-[rgba(30,41,59,0.6)] transition-colors duration-[120ms] ${
                      idx < filtered.length - 1 ? 'border-b border-[#1f2937]' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-[12px] text-slate-400 whitespace-nowrap">
                      {pessoa.id}
                    </td>

                    <td className="py-3 px-4 text-[14px] font-medium text-white whitespace-nowrap">
                      {pessoa.nome}
                    </td>

                    <td className="py-3 px-4">
                      {pessoa.empresasIds.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {pessoa.empresasIds.map((eid) => (
                            <EmpresaChip key={eid} empresaId={eid} onOpenEmpresa={handleOpenEmpresa} />
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[12px]">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-[13px] text-slate-300 whitespace-nowrap">
                      {pessoa.cargo ? CARGO_LABELS[pessoa.cargo] : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <WhatsAppPill telefone={pessoa.telefone} />
                    </td>

                    <td className="py-3 px-4">
                      <TipoBadge tipo={pessoa.tipoContato} />
                    </td>

                    <td className="py-3 px-4 text-[13px] text-slate-300 whitespace-nowrap">
                      {pessoa.cidade && pessoa.uf ? (
                        <>
                          {pessoa.cidade}
                          <span className="text-slate-500"> / </span>
                          {pessoa.uf}
                        </>
                      ) : (
                        pessoa.cidade ?? pessoa.uf ?? (
                          <span className="text-slate-500">—</span>
                        )
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <RowAction
                          icon={PENCIL_ICON}
                          label="Editar"
                          onClick={() => setModalEditar(pessoa)}
                        />
                        <RowAction
                          icon={TRASH_ICON}
                          label="Excluir"
                          danger
                          onClick={() => handleDelete(pessoa.id, pessoa.nome)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
