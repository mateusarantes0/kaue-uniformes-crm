import { useState } from 'react'
import toast from 'react-hot-toast'
import { useOrcamentoStore } from '../../store/useOrcamentoStore'
import { useEmpresaStore } from '../../store/useEmpresaStore'
import { usePessoaStore } from '../../store/usePessoaStore'
import {
  COLUNA_LABELS, COLUNA_BADGE, ORIGEM_LABELS, CAMPANHA_LABELS, TIPO_OBJECAO_LABELS,
} from '../../types'
import { formatCurrency, stripMask } from '../../utils'

export function OrcamentoDetalhe() {
  const modalDetalheId = useOrcamentoStore((s) => s.modalDetalheId)
  const orcamentos = useOrcamentoStore((s) => s.orcamentos)
  const setModalDetalheId = useOrcamentoStore((s) => s.setModalDetalheId)
  const setModalEditar = useOrcamentoStore((s) => s.setModalEditar)
  const updateOrcamento = useOrcamentoStore((s) => s.updateOrcamento)
  const marcarComoGanha = useOrcamentoStore((s) => s.marcarComoGanha)
  const marcarComoPerdida = useOrcamentoStore((s) => s.marcarComoPerdida)
  const addItemAcao = useOrcamentoStore((s) => s.addItemAcao)
  const toggleItemAcao = useOrcamentoStore((s) => s.toggleItemAcao)
  const deleteItemAcao = useOrcamentoStore((s) => s.deleteItemAcao)

  const empresas = useEmpresaStore((s) => s.empresas)
  const pessoas = usePessoaStore((s) => s.pessoas)

  const [editCenario, setEditCenario] = useState(false)
  const [cenarioText, setCenarioText] = useState('')
  const [novoItem, setNovoItem] = useState('')
  const [showPerdida, setShowPerdida] = useState(false)
  const [perdidaTipo, setPerdidaTipo] = useState<'preco' | 'prazo' | 'concorrencia' | 'sem_retorno'>('preco')
  const [perdidaObs, setPerdidaObs] = useState('')

  if (!modalDetalheId) return null
  const o = orcamentos.find((x) => x.id === modalDetalheId)
  if (!o) return null

  const empresa = o.empresaId ? empresas.find((e) => e.id === o.empresaId) : undefined
  const contatos = pessoas.filter((p) => o.contatosIds.includes(p.id))
  const primeiroContato = contatos[0]

  const close = () => setModalDetalheId(null)

  const handleSaveCenario = () => {
    updateOrcamento(o.id, { cenarioAtual: cenarioText })
    setEditCenario(false)
    toast.success('Cenário salvo!')
  }

  const handleAddItem = () => {
    if (!novoItem.trim()) return
    addItemAcao(o.id, novoItem.trim())
    setNovoItem('')
  }

  const handleGanha = () => {
    marcarComoGanha(o.id)
    toast.success('🏆 Marcado como Ganho!')
    close()
  }

  const handlePerdida = () => {
    marcarComoPerdida(o.id, perdidaTipo, perdidaObs || undefined)
    toast('😢 Marcado como Perdido')
    close()
  }

  const fmt = (d?: string) =>
    d ? new Date(d.includes('T') ? d : d + 'T12:00:00').toLocaleDateString('pt-BR') : '—'

  const itensPendentes = o.itensAcao.filter((i) => !i.concluido).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1E293B] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden border border-slate-700 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-slate-500 font-mono">{o.id}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COLUNA_BADGE[o.coluna]}`}>
                {COLUNA_LABELS[o.coluna]}
              </span>
              {itensPendentes > 0 && (
                <span className="text-xs bg-amber-900/40 text-amber-400 px-2 py-0.5 rounded-full">
                  {itensPendentes} ação pendente{itensPendentes > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <h2 className="text-white font-bold text-lg leading-tight">{o.nome}</h2>
            {empresa && <p className="text-slate-400 text-sm">{empresa.nome}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { close(); setModalEditar(o) }}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
              title="Editar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button onClick={close} className="text-slate-400 hover:text-white p-1 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-700/60">
            {/* Left — Dados */}
            <div className="p-4 space-y-4">
              {/* Valor / Prob */}
              <div className="flex gap-4">
                {o.valor != null && (
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Valor</p>
                    <p className="text-accent font-bold text-lg">{formatCurrency(o.valor)}</p>
                  </div>
                )}
                {o.probabilidade != null && (
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Probabilidade</p>
                    <p className="text-white font-bold text-lg">{o.probabilidade}%</p>
                  </div>
                )}
              </div>

              {/* Contatos */}
              {contatos.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Contatos ({contatos.length})</p>
                  <div className="space-y-1.5">
                    {contatos.map((p) => (
                      <div key={p.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-sm text-white font-medium">{p.nome}</p>
                          {p.cargo && <p className="text-xs text-slate-500">{p.cargo.replace(/_/g, ' ')}</p>}
                        </div>
                        {p.telefone && (
                          <button
                            onClick={() => window.open(`https://wa.me/55${stripMask(p.telefone!)}`, '_blank')}
                            title="WhatsApp"
                            className="text-green-400 hover:text-green-300 transition-colors"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Datas */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {[
                  ['Último Contato', o.ultimoContatoEm],
                  ['Orçamento Enviado', o.orcamentoEnviadoEm],
                  ['Fechamento Esperado', o.dataFechamentoEsperada],
                  ['Data de Entrega', o.dataEntrega],
                  ['Vendido Em', o.vendidoEm],
                  ['Data da Perda', o.dataPerda],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label as string}>
                    <p className="text-slate-500">{label as string}</p>
                    <p className="text-slate-300">{fmt(value as string)}</p>
                  </div>
                ))}
              </div>

              {/* Origem / Campanhas */}
              {o.origem && (
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Origem</p>
                  <p className="text-xs text-slate-300">{ORIGEM_LABELS[o.origem]}</p>
                </div>
              )}
              {o.campanhasOfertadas.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Campanhas Ofertadas</p>
                  <div className="flex flex-wrap gap-1">
                    {o.campanhasOfertadas.map((c) => (
                      <span key={c} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                        {CAMPANHA_LABELS[c]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {o.tipoObjecao && (
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Objeção</p>
                  <p className="text-xs text-orange-400">{TIPO_OBJECAO_LABELS[o.tipoObjecao]}</p>
                  {o.observacaoObjecao && <p className="text-xs text-slate-400 mt-0.5">{o.observacaoObjecao}</p>}
                </div>
              )}
            </div>

            {/* Right — Ação */}
            <div className="p-4 space-y-4">
              {/* Cenário atual */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-slate-500">📝 Cenário Atual</p>
                  {!editCenario ? (
                    <button
                      onClick={() => { setCenarioText(o.cenarioAtual ?? ''); setEditCenario(true) }}
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Editar
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={handleSaveCenario} className="text-xs text-accent hover:text-accent-light">Salvar</button>
                      <button onClick={() => setEditCenario(false)} className="text-xs text-slate-500 hover:text-slate-300">×</button>
                    </div>
                  )}
                </div>
                {editCenario ? (
                  <textarea
                    autoFocus
                    className="input resize-none w-full text-sm"
                    rows={4}
                    value={cenarioText}
                    onChange={(e) => setCenarioText(e.target.value)}
                    placeholder="Descreva o cenário atual..."
                  />
                ) : (
                  <p className="text-sm text-slate-300 whitespace-pre-wrap min-h-8">
                    {o.cenarioAtual || <span className="text-slate-600 italic">Clique em Editar para adicionar...</span>}
                  </p>
                )}
              </div>

              {/* Itens de ação */}
              <div>
                <p className="text-xs text-slate-500 mb-2">✅ Itens de Ação</p>
                <div className="space-y-1 mb-2 max-h-40 overflow-y-auto">
                  {o.itensAcao.length === 0 && (
                    <p className="text-xs text-slate-600 italic">Nenhum item ainda.</p>
                  )}
                  {o.itensAcao.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 group">
                      <input
                        type="checkbox"
                        checked={item.concluido}
                        onChange={() => toggleItemAcao(o.id, item.id)}
                        className="accent-amber-500 flex-shrink-0"
                      />
                      <span className={`text-sm flex-1 ${item.concluido ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                        {item.texto}
                      </span>
                      <button
                        onClick={() => deleteItemAcao(o.id, item.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="input flex-1 text-sm"
                    placeholder="Novo item de ação..."
                    value={novoItem}
                    onChange={(e) => setNovoItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                  />
                  <button onClick={handleAddItem} className="btn-secondary text-xs px-3">+</button>
                </div>
              </div>

              {/* Próxima atividade */}
              {o.proximaAtividade && (
                <div className="bg-slate-800/50 rounded-lg px-3 py-2">
                  <p className="text-xs text-slate-500">Próxima Atividade</p>
                  <p className="text-sm text-white">{o.proximaAtividade}</p>
                </div>
              )}

              {/* Histórico */}
              <div>
                <p className="text-xs text-slate-500 mb-2">📜 Histórico</p>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {[...o.historico].reverse().map((h, i) => (
                    <div key={i} className="text-xs text-slate-400 bg-slate-800/40 rounded px-2 py-1.5">
                      <span className="text-slate-500">{new Date(h.data).toLocaleDateString('pt-BR')}</span>
                      {' — '}{h.texto}
                    </div>
                  ))}
                </div>
              </div>

              {/* Perdida inline */}
              {showPerdida && (
                <div className="p-3 bg-red-950/30 border border-red-800/50 rounded-lg space-y-2">
                  <p className="text-xs text-red-400 font-medium">Motivo da Perda</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['preco', 'prazo', 'concorrencia', 'sem_retorno'] as const).map((k) => (
                      <label key={k} className={`flex items-center gap-1.5 p-1.5 rounded border cursor-pointer text-xs ${perdidaTipo === k ? 'border-red-500 text-white bg-red-900/30' : 'border-slate-700 text-slate-400'}`}>
                        <input type="radio" checked={perdidaTipo === k} onChange={() => setPerdidaTipo(k)} className="accent-red-500" />
                        {k === 'preco' ? 'Preço' : k === 'prazo' ? 'Prazo' : k === 'concorrencia' ? 'Concorrência' : 'Sem retorno'}
                      </label>
                    ))}
                  </div>
                  <input className="input text-xs" placeholder="Observação..." value={perdidaObs} onChange={(e) => setPerdidaObs(e.target.value)} />
                  <div className="flex gap-2">
                    <button onClick={handlePerdida} className="bg-red-700 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">Confirmar</button>
                    <button onClick={() => setShowPerdida(false)} className="btn-ghost text-xs">Cancelar</button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-700/60">
                <button onClick={handleGanha} className="flex-1 bg-green-800 hover:bg-green-700 text-white font-semibold text-sm py-2 rounded-lg transition-colors">
                  🏆 Marcar como Ganha
                </button>
                <button onClick={() => setShowPerdida(!showPerdida)} className="flex-1 bg-red-900/50 hover:bg-red-800/70 text-red-300 font-semibold text-sm py-2 rounded-lg transition-colors">
                  😢 Marcar como Perdida
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
