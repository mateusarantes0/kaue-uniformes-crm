import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useOrcamentoStore } from '../../store/useOrcamentoStore'
import { useEmpresaStore } from '../../store/useEmpresaStore'
import { usePessoaStore } from '../../store/usePessoaStore'
import {
  Orcamento, Coluna, Origem, Campanha, COLUNAS, ORIGEM_LABELS, CAMPANHA_LABELS,
} from '../../types'
import { ModalShell, Field } from './CreateModal'

const USERS = [
  { id: 'admin', name: 'Admin' },
  { id: 'noemi', name: 'Noemi' },
  { id: 'dione', name: 'Dione' },
]

const COLUNA_OPTIONS: Coluna[] = ['lead', 'qualificacao', 'orcamento_enviado', 'negociacao', 'aguardando']

function Combobox({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div ref={ref} className="relative">
      <input
        className="input"
        value={open ? search : (selected?.label ?? '')}
        onChange={(e) => { setSearch(e.target.value); setOpen(true) }}
        onFocus={() => { setSearch(''); setOpen(true) }}
        placeholder={placeholder ?? 'Selecionar...'}
      />
      {open && (
        <div className="absolute z-50 w-full bg-[#1E293B] border border-slate-600 rounded-lg mt-1 max-h-44 overflow-y-auto shadow-xl">
          <div
            className="px-3 py-2 text-xs text-slate-500 hover:bg-slate-700 cursor-pointer"
            onMouseDown={() => { onChange(''); setOpen(false); setSearch('') }}
          >
            — Nenhum —
          </div>
          {filtered.map((o) => (
            <div
              key={o.value}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-700 ${value === o.value ? 'text-accent' : 'text-slate-200'}`}
              onMouseDown={() => { onChange(o.value); setOpen(false); setSearch('') }}
            >
              {o.label}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-xs text-slate-500">Nenhum resultado</div>
          )}
        </div>
      )}
    </div>
  )
}

function MultiCheckList({
  values,
  options,
  onChange,
  searchable,
}: {
  values: string[]
  options: { value: string; label: string }[]
  onChange: (v: string[]) => void
  searchable?: boolean
}) {
  const [search, setSearch] = useState('')
  const filtered = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  return (
    <div>
      {searchable && (
        <input
          className="input mb-2 text-xs"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}
      <div className="max-h-36 overflow-y-auto space-y-0.5 border border-slate-700 rounded-lg p-1.5">
        {filtered.map((o) => (
          <label
            key={o.value}
            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-700/50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={values.includes(o.value)}
              onChange={(e) =>
                onChange(
                  e.target.checked
                    ? [...values, o.value]
                    : values.filter((v) => v !== o.value)
                )
              }
              className="accent-amber-500 w-3.5 h-3.5 flex-shrink-0"
            />
            <span className="text-xs text-slate-300">{o.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export function OrcamentoModal() {
  const modalCriar = useOrcamentoStore((s) => s.modalCriar)
  const modalEditar = useOrcamentoStore((s) => s.modalEditar)
  const setModalCriar = useOrcamentoStore((s) => s.setModalCriar)
  const setModalEditar = useOrcamentoStore((s) => s.setModalEditar)
  const addOrcamento = useOrcamentoStore((s) => s.addOrcamento)
  const updateOrcamento = useOrcamentoStore((s) => s.updateOrcamento)
  const marcarComoGanha = useOrcamentoStore((s) => s.marcarComoGanha)
  const marcarComoPerdida = useOrcamentoStore((s) => s.marcarComoPerdida)

  const empresas = useEmpresaStore((s) => s.empresas)
  const addEmpresa = useEmpresaStore((s) => s.addEmpresa)
  const pessoas = usePessoaStore((s) => s.pessoas)
  const addPessoa = usePessoaStore((s) => s.addPessoa)

  const isEdit = !!modalEditar
  const o = modalEditar

  const [tab, setTab] = useState<1 | 2 | 3>(1)

  // Tab 1
  const [nome, setNome] = useState(o?.nome ?? '')
  const [responsavelId, setResponsavelId] = useState(o?.responsavelId ?? 'admin')
  const [empresaId, setEmpresaId] = useState(o?.empresaId ?? '')
  const [contatosIds, setContatosIds] = useState<string[]>(o?.contatosIds ?? [])
  const [coluna, setColuna] = useState<Coluna>(o?.coluna ?? 'lead')
  const [origem, setOrigem] = useState<Origem | ''>(o?.origem ?? '')

  // Tab 2
  const [valor, setValor] = useState(o?.valor?.toString() ?? '')
  const [probabilidade, setProbabilidade] = useState(o?.probabilidade?.toString() ?? '')
  const [ultimoContatoEm, setUltimoContatoEm] = useState(o?.ultimoContatoEm?.split('T')[0] ?? '')
  const [orcamentoEnviadoEm, setOrcamentoEnviadoEm] = useState(o?.orcamentoEnviadoEm ?? '')
  const [dataFechamentoEsperada, setDataFechamentoEsperada] = useState(o?.dataFechamentoEsperada ?? '')
  const [proximaAtividade, setProximaAtividade] = useState(o?.proximaAtividade ?? '')
  const [dataEntrega, setDataEntrega] = useState(o?.dataEntrega ?? '')
  const [campanhasOfertadas, setCampanhasOfertadas] = useState<Campanha[]>(o?.campanhasOfertadas ?? [])
  const [fechouPela, setFechouPela] = useState<Campanha | ''>(o?.fechouPela ?? '')

  // Tab 3
  const [cenarioAtual, setCenarioAtual] = useState(o?.cenarioAtual ?? '')

  // Nested quick-add
  const [quickEmpresaNome, setQuickEmpresaNome] = useState('')
  const [quickPessoaNome, setQuickPessoaNome] = useState('')
  const [showQuickEmpresa, setShowQuickEmpresa] = useState(false)
  const [showQuickPessoa, setShowQuickPessoa] = useState(false)

  // Perdida inline
  const [showPerdida, setShowPerdida] = useState(false)
  const [perdidaTipo, setPerdidaTipo] = useState<'preco' | 'prazo' | 'concorrencia' | 'sem_retorno'>('preco')
  const [perdidaObs, setPerdidaObs] = useState('')

  const close = () => {
    setModalCriar(false)
    setModalEditar(null)
  }

  const handleSave = () => {
    if (!nome.trim()) return
    const data = {
      nome: nome.trim(),
      responsavelId,
      empresaId: empresaId || undefined,
      contatosIds,
      coluna,
      origem: (origem as Origem) || undefined,
      valor: valor ? Number(valor) : undefined,
      probabilidade: probabilidade ? Number(probabilidade) : undefined,
      ultimoContatoEm: ultimoContatoEm || undefined,
      orcamentoEnviadoEm: orcamentoEnviadoEm || undefined,
      dataFechamentoEsperada: dataFechamentoEsperada || undefined,
      proximaAtividade: proximaAtividade || undefined,
      dataEntrega: dataEntrega || undefined,
      campanhasOfertadas,
      fechouPela: (fechouPela as Campanha) || undefined,
      cenarioAtual: cenarioAtual || undefined,
    }
    if (isEdit && o) {
      updateOrcamento(o.id, data)
      toast.success('Orçamento atualizado!')
    } else {
      addOrcamento(data)
      toast.success(`"${nome}" criado!`)
    }
    close()
  }

  const handleGanha = () => {
    if (!o) return
    marcarComoGanha(o.id)
    toast.success('🏆 Marcado como Ganho!')
    close()
  }

  const handlePerdida = () => {
    if (!o) return
    marcarComoPerdida(o.id, perdidaTipo, perdidaObs || undefined)
    toast('😢 Marcado como Perdido')
    close()
  }

  const handleQuickEmpresa = () => {
    if (!quickEmpresaNome.trim()) return
    const nova = addEmpresa({ nome: quickEmpresaNome.trim(), responsaveisIds: [] })
    setEmpresaId(nova.id)
    setQuickEmpresaNome('')
    setShowQuickEmpresa(false)
    toast.success(`Empresa "${nova.nome}" criada!`)
  }

  const handleQuickPessoa = () => {
    if (!quickPessoaNome.trim()) return
    const nova = addPessoa({ nome: quickPessoaNome.trim(), responsaveisIds: [] })
    setContatosIds((prev) => [...prev, nova.id])
    setQuickPessoaNome('')
    setShowQuickPessoa(false)
    toast.success(`Pessoa "${nova.nome}" criada!`)
  }

  const empresaOptions = empresas.map((e) => ({ value: e.id, label: e.nome }))
  const pessoaOptions = pessoas.map((p) => ({ value: p.id, label: p.nome }))
  const origemOptions = (Object.entries(ORIGEM_LABELS) as [Origem, string][]).map(([v, l]) => ({ value: v, label: l }))
  const campanhaOptions = (Object.entries(CAMPANHA_LABELS) as [Campanha, string][]).map(([v, l]) => ({ value: v, label: l }))
  const showFechouPela = coluna === 'vendido' || coluna === 'sucesso'

  return (
    <ModalShell title={isEdit ? `Editar: ${o?.nome}` : 'Novo Orçamento'} onClose={close} wide>
      {/* Tabs */}
      <div className="flex border-b border-slate-700 mb-4">
        {(['Identificação', 'Comercial', 'Detalhes'] as const).map((label, i) => (
          <button
            key={i}
            onClick={() => setTab((i + 1) as 1 | 2 | 3)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === i + 1 ? 'text-accent border-b-2 border-accent' : 'text-slate-400 hover:text-white'
            }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      {/* Tab 1 */}
      {tab === 1 && (
        <div className="space-y-3">
          <Field label="Nome do Orçamento *">
            <input autoFocus className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Uniformes Restaurante ABC" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Responsável">
              <select className="input" value={responsavelId} onChange={(e) => setResponsavelId(e.target.value)}>
                {USERS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </Field>
            <Field label="Coluna Inicial">
              <select className="input" value={coluna} onChange={(e) => setColuna(e.target.value as Coluna)}>
                {COLUNA_OPTIONS.map((c) => (
                  <option key={c} value={c}>{COLUNAS.find((x) => x.id === c)?.label ?? c}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Empresa */}
          <Field label="Empresa">
            <div className="flex gap-2">
              <div className="flex-1">
                <Combobox value={empresaId} options={empresaOptions} onChange={setEmpresaId} placeholder="Selecionar empresa..." />
              </div>
              <button
                type="button"
                onClick={() => setShowQuickEmpresa(!showQuickEmpresa)}
                title="Nova Empresa"
                className="text-slate-400 hover:text-accent px-2 border border-slate-700 rounded-lg text-sm transition-colors"
              >
                +
              </button>
            </div>
            {showQuickEmpresa && (
              <div className="mt-2 flex gap-2">
                <input
                  className="input flex-1 text-xs"
                  placeholder="Nome da nova empresa"
                  value={quickEmpresaNome}
                  onChange={(e) => setQuickEmpresaNome(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickEmpresa()}
                  autoFocus
                />
                <button onClick={handleQuickEmpresa} className="btn-primary text-xs px-3">Criar</button>
                <button onClick={() => setShowQuickEmpresa(false)} className="btn-ghost text-xs">×</button>
              </div>
            )}
          </Field>

          {/* Contatos */}
          <Field label="Contatos">
            <div className="flex gap-2 mb-2">
              <span className="text-xs text-slate-400 flex-1">{contatosIds.length} selecionado(s)</span>
              <button
                type="button"
                onClick={() => setShowQuickPessoa(!showQuickPessoa)}
                className="text-slate-400 hover:text-accent text-xs transition-colors"
              >
                + Nova Pessoa
              </button>
            </div>
            {showQuickPessoa && (
              <div className="mb-2 flex gap-2">
                <input
                  className="input flex-1 text-xs"
                  placeholder="Nome da nova pessoa"
                  value={quickPessoaNome}
                  onChange={(e) => setQuickPessoaNome(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickPessoa()}
                  autoFocus
                />
                <button onClick={handleQuickPessoa} className="btn-primary text-xs px-3">Criar</button>
                <button onClick={() => setShowQuickPessoa(false)} className="btn-ghost text-xs">×</button>
              </div>
            )}
            <MultiCheckList
              values={contatosIds}
              options={pessoaOptions}
              onChange={setContatosIds}
              searchable
            />
          </Field>

          <Field label="Origem">
            <Combobox value={origem} options={origemOptions} onChange={(v) => setOrigem(v as Origem | '')} placeholder="Selecionar origem..." />
          </Field>
        </div>
      )}

      {/* Tab 2 */}
      {tab === 2 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor (R$)">
              <input className="input" type="number" min="0" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" />
            </Field>
            <Field label="Probabilidade (%)">
              <input className="input" type="number" min="0" max="100" value={probabilidade} onChange={(e) => setProbabilidade(e.target.value)} placeholder="0–100" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Último Contato">
              <input className="input" type="date" value={ultimoContatoEm} onChange={(e) => setUltimoContatoEm(e.target.value)} />
            </Field>
            <Field label="Orçamento Enviado Em">
              <input className="input" type="date" value={orcamentoEnviadoEm} onChange={(e) => setOrcamentoEnviadoEm(e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fechamento Esperado">
              <input className="input" type="date" value={dataFechamentoEsperada} onChange={(e) => setDataFechamentoEsperada(e.target.value)} />
            </Field>
            <Field label="Data de Entrega">
              <input className="input" type="date" value={dataEntrega} onChange={(e) => setDataEntrega(e.target.value)} />
            </Field>
          </div>
          <Field label="Próxima Atividade">
            <input className="input" value={proximaAtividade} onChange={(e) => setProximaAtividade(e.target.value)} placeholder="Ex: Ligar amanhã às 14h" />
          </Field>
          <Field label="Campanhas Ofertadas">
            <MultiCheckList
              values={campanhasOfertadas}
              options={campanhaOptions}
              onChange={(v) => setCampanhasOfertadas(v as Campanha[])}
            />
          </Field>
          {showFechouPela && (
            <Field label="Fechou pela Campanha">
              <select className="input" value={fechouPela} onChange={(e) => setFechouPela(e.target.value as Campanha | '')}>
                <option value="">— Nenhuma —</option>
                {campanhaOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
          )}
        </div>
      )}

      {/* Tab 3 */}
      {tab === 3 && (
        <div className="space-y-3">
          <Field label="Cenário Atual">
            <textarea
              className="input resize-none"
              rows={5}
              value={cenarioAtual}
              onChange={(e) => setCenarioAtual(e.target.value)}
              placeholder="Descreva o contexto e situação atual do cliente..."
            />
          </Field>
          {isEdit && o && (
            <div>
              <p className="text-xs text-slate-400 mb-1">Itens de Ação</p>
              <p className="text-xs text-slate-500">Gerencie os itens de ação no painel de detalhe do orçamento.</p>
            </div>
          )}
        </div>
      )}

      {/* Perdida inline */}
      {isEdit && showPerdida && (
        <div className="mt-4 p-3 bg-red-950/30 border border-red-800/50 rounded-lg space-y-3">
          <p className="text-sm text-red-400 font-medium">Motivo da Perda</p>
          <div className="grid grid-cols-2 gap-2">
            {(['preco', 'prazo', 'concorrencia', 'sem_retorno'] as const).map((k) => (
              <label key={k} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs ${perdidaTipo === k ? 'border-red-500 text-white bg-red-900/30' : 'border-slate-700 text-slate-400'}`}>
                <input type="radio" name="perdida" value={k} checked={perdidaTipo === k} onChange={() => setPerdidaTipo(k)} className="accent-red-500" />
                {k === 'preco' ? 'Preço' : k === 'prazo' ? 'Prazo' : k === 'concorrencia' ? 'Concorrência' : 'Sem retorno'}
              </label>
            ))}
          </div>
          <input className="input text-xs" placeholder="Observação (opcional)" value={perdidaObs} onChange={(e) => setPerdidaObs(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={handlePerdida} className="bg-red-700 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">Confirmar Perda</button>
            <button onClick={() => setShowPerdida(false)} className="btn-ghost text-xs">Cancelar</button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700 mt-4">
        <div className="flex gap-2">
          {isEdit && (
            <>
              <button
                onClick={handleGanha}
                className="bg-green-700 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                🏆 Ganho
              </button>
              <button
                onClick={() => setShowPerdida(!showPerdida)}
                className="bg-red-900/60 hover:bg-red-800 text-red-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                😢 Perdido
              </button>
            </>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={close} className="btn-ghost">Cancelar</button>
          <button onClick={handleSave} disabled={!nome.trim()} className="btn-primary">
            {isEdit ? 'Salvar Alterações' : 'Criar Orçamento'}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
