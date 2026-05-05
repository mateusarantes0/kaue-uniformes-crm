import { useState } from 'react'
import toast from 'react-hot-toast'
import { useOrcamentoStore } from '../../store/useOrcamentoStore'
import { useEmpresaStore } from '../../store/useEmpresaStore'
import { usePessoaStore } from '../../store/usePessoaStore'
import {
  Orcamento, Coluna, Origem, Campanha, COLUNAS, ORIGEM_LABELS, CAMPANHA_LABELS, CARGO_LABELS,
  Empresa, Pessoa,
} from '../../types'
import { ModalShell, Field } from './CreateModal'
import { stripMask } from '../../utils'
import { SearchableMultiSelect } from '../ui/SearchableMultiSelect'
import { CurrencyInput } from '../ui/CurrencyInput'

const USERS = [
  { id: 'admin', name: 'Admin' },
  { id: 'noemi', name: 'Noemi' },
  { id: 'dione', name: 'Dione' },
]

const COLUNA_OPTIONS: Coluna[] = ['lead', 'qualificacao', 'orcamento_enviado', 'negociacao', 'aguardando']

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

const WA_ICON = (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
)

function EmpresaChip({ empresa, onRemove, onOpen }: { empresa: Empresa; onRemove: () => void; onOpen: () => void }) {
  return (
    <div className="flex items-center gap-2 bg-slate-700 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-white">
      <button type="button" onClick={onOpen} className="text-accent hover:underline font-medium">
        {empresa.nome}
      </button>
      <button type="button" onClick={onRemove} className="text-slate-400 hover:text-red-400 transition-colors">
        ×
      </button>
    </div>
  )
}

function PessoaChip({ pessoa, onRemove }: { pessoa: Pessoa; onRemove: () => void }) {
  return (
    <div className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm text-white font-medium truncate">{pessoa.nome}</p>
          {pessoa.cargo && (
            <p className="text-xs text-slate-400">{CARGO_LABELS[pessoa.cargo]}</p>
          )}
          {pessoa.telefone && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400 font-mono">{pessoa.telefone}</span>
              <button
                type="button"
                onClick={() => window.open(`https://wa.me/55${stripMask(pessoa.telefone!)}`, '_blank')}
                title="WhatsApp"
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                {WA_ICON}
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-slate-400 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
        >
          ×
        </button>
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
  const setEmpresaModalEditar = useEmpresaStore((s) => s.setModalEditar)
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
  const [valor, setValor] = useState<number | undefined>(o?.valor)
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
      valor,
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
    const nova = addPessoa({ nome: quickPessoaNome.trim(), responsaveisIds: [], empresasIds: [] })
    setContatosIds((prev) => [...prev, nova.id])
    setQuickPessoaNome('')
    setShowQuickPessoa(false)
    toast.success(`Pessoa "${nova.nome}" criada!`)
  }

  const empresaSelecionada = empresaId ? empresas.find((e) => e.id === empresaId) : undefined
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
            {empresaSelecionada ? (
              <EmpresaChip
                empresa={empresaSelecionada}
                onRemove={() => setEmpresaId('')}
                onOpen={() => { close(); setEmpresaModalEditar(empresaSelecionada) }}
              />
            ) : (
              <div className="space-y-2">
                <SearchableMultiSelect
                  items={empresas}
                  selectedIds={empresaId ? [empresaId] : []}
                  onChange={(ids) => setEmpresaId(ids[0] ?? '')}
                  getId={(e) => e.id}
                  getLabel={(e) => e.nome}
                  placeholder="Buscar empresa..."
                  single
                  onCreateNew={() => setShowQuickEmpresa(!showQuickEmpresa)}
                />
                {showQuickEmpresa && (
                  <div className="flex gap-2">
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
              </div>
            )}
          </Field>

          {/* Contatos */}
          <Field label="Contatos">
            <SearchableMultiSelect
              items={pessoas}
              selectedIds={contatosIds}
              onChange={setContatosIds}
              getId={(p) => p.id}
              getLabel={(p) => p.nome}
              getSubLabel={(p) => p.cargo ? CARGO_LABELS[p.cargo] : p.telefone ?? ''}
              placeholder="Buscar contato..."
              onCreateNew={() => setShowQuickPessoa(!showQuickPessoa)}
              renderChip={(pessoa, onRemove) => (
                <PessoaChip key={pessoa.id} pessoa={pessoa} onRemove={onRemove} />
              )}
            />
            {showQuickPessoa && (
              <div className="mt-2 flex gap-2">
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
          </Field>

          <Field label="Origem">
            <select
              className="input"
              value={origem}
              onChange={(e) => setOrigem(e.target.value as Origem | '')}
            >
              <option value="">— Selecionar —</option>
              {origemOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {/* Tab 2 */}
      {tab === 2 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor (R$)">
              <CurrencyInput value={valor} onChange={setValor} />
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
