import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useOrcamentoStore } from '../../store/useOrcamentoStore'
import { useEmpresaStore } from '../../store/useEmpresaStore'
import { usePessoaStore } from '../../store/usePessoaStore'
import {
  Coluna, TipoObjecao,
  ORIGEM_LABELS, CAMPANHA_LABELS, TIPO_OBJECAO_LABELS,
} from '../../types'
import { formatCurrency, diasDesde } from '../../utils'
import { StageBadge } from '../orcamento/StageBadge'
import { ContactCard } from '../orcamento/ContactCard'
import { DateRow } from '../orcamento/DateRow'
import { CenarioInlineEditable } from '../orcamento/CenarioInlineEditable'
import { ActionItem } from '../orcamento/ActionItem'
import { AddActionItem } from '../orcamento/AddActionItem'
import { HistoricoEntry } from '../orcamento/HistoricoEntry'

const CLOSED_COLS: Coluna[] = ['vendido', 'sucesso', 'perdido']

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent mb-3">
      {children}
    </h3>
  )
}

export function OrcamentoDetalhe() {
  const modalDetalheId    = useOrcamentoStore((s) => s.modalDetalheId)
  const orcamentos        = useOrcamentoStore((s) => s.orcamentos)
  const setModalDetalheId = useOrcamentoStore((s) => s.setModalDetalheId)
  const setModalEditar    = useOrcamentoStore((s) => s.setModalEditar)
  const updateOrcamento   = useOrcamentoStore((s) => s.updateOrcamento)
  const marcarComoGanha   = useOrcamentoStore((s) => s.marcarComoGanha)
  const marcarComoPerdida = useOrcamentoStore((s) => s.marcarComoPerdida)
  const deleteOrcamento   = useOrcamentoStore((s) => s.deleteOrcamento)
  const addItemAcao       = useOrcamentoStore((s) => s.addItemAcao)
  const toggleItemAcao    = useOrcamentoStore((s) => s.toggleItemAcao)
  const deleteItemAcao    = useOrcamentoStore((s) => s.deleteItemAcao)

  const empresas             = useEmpresaStore((s) => s.empresas)
  const setEmpresaModalEditar = useEmpresaStore((s) => s.setModalEditar)
  const pessoas              = usePessoaStore((s) => s.pessoas)
  const setPessoaModalEditar  = usePessoaStore((s) => s.setModalEditar)

  const [showPerdida,  setShowPerdida]  = useState(false)
  const [perdidaTipo,  setPerdidaTipo]  = useState<TipoObjecao>('preco')
  const [perdidaObs,   setPerdidaObs]   = useState('')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') useOrcamentoStore.getState().setModalDetalheId(null)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  if (!modalDetalheId) return null
  const o = orcamentos.find((x) => x.id === modalDetalheId)
  if (!o) return null

  const empresa  = o.empresaId ? empresas.find((e) => e.id === o.empresaId) : undefined
  const contatos = pessoas.filter((p) => o.contatosIds.includes(p.id))
  const isClosed = CLOSED_COLS.includes(o.coluna)
  const diasUltimoContato = diasDesde(o.ultimoContatoEm ?? o.criadoEm)

  const close = () => setModalDetalheId(null)

  const handleGanha = () => {
    marcarComoGanha(o.id)
    toast.success('🏆 Orçamento fechado como ganho!')
    close()
  }

  const handlePerdida = () => {
    marcarComoPerdida(o.id, perdidaTipo, perdidaObs || undefined)
    toast('😢 Orçamento marcado como perdido')
    setShowPerdida(false)
    close()
  }

  const handleDelete = () => {
    if (confirm('Excluir este orçamento? Esta ação não pode ser desfeita.')) {
      deleteOrcamento(o.id)
      toast.success('Orçamento excluído')
      close()
    }
  }

  const handleAbrirContato = (id: string) => {
    const p = pessoas.find((x) => x.id === id)
    if (p) { close(); setPessoaModalEditar(p) }
  }

  const handleAbrirEmpresa = () => {
    if (empresa) { close(); setEmpresaModalEditar(empresa) }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-[5vh_5vw] bg-[rgba(2,6,16,0.72)] animate-kaue-fade"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-labelledby="orc-detail-title"
    >
      <div
        className="w-[90vw] h-[90vh] max-w-[1440px] bg-card rounded-[20px] flex flex-col overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.55)] animate-kaue-rise"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ───── HEADER ───── */}
        <header className="px-7 pt-5 pb-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[12px] text-slate-400">{o.id}</p>
              <h1
                id="orc-detail-title"
                className="mt-2 text-[26px] font-bold tracking-[-0.015em] text-white truncate"
              >
                {o.nome}
              </h1>
            </div>
            <div className="flex items-center gap-3 ml-4 flex-shrink-0">
              <StageBadge coluna={o.coluna} />
              <button
                onClick={close}
                aria-label="Fechar"
                title="Fechar"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-[#243044] hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-3.5 flex flex-wrap items-baseline gap-x-7 gap-y-2">
            {empresa && (
              <button
                onClick={handleAbrirEmpresa}
                className="text-[14px] font-medium text-orange-300 border-b border-orange-300/40 hover:text-orange-200 transition-colors"
              >
                {empresa.nome}
              </button>
            )}
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">Valor</p>
              <p className="font-mono text-[22px] font-bold text-accent leading-tight">
                {formatCurrency(o.valor ?? 0)}
              </p>
            </div>
            {o.probabilidade != null && (
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">Probabilidade</p>
                <p className="text-[18px] font-semibold text-white leading-tight">
                  {o.probabilidade}
                  <span className="text-slate-400 text-[14px] font-normal">%</span>
                </p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">Último contato</p>
              <p className={`text-[14px] leading-tight ${diasUltimoContato > 5 ? 'text-red-300' : 'text-white'}`}>
                {diasUltimoContato === 0
                  ? 'Hoje'
                  : `há ${diasUltimoContato} dia${diasUltimoContato > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </header>

        {/* ───── BODY (2 colunas) ───── */}
        <div className="flex-1 min-h-0 grid grid-cols-[40%_60%] overflow-hidden">

          {/* PANE ESQUERDO */}
          <div className="bg-[#1a2336] overflow-y-auto px-6 py-5 border-r border-slate-700 min-w-0">

            <SectionTitle>Empresa & Contatos</SectionTitle>

            {empresa && (
              <button
                onClick={handleAbrirEmpresa}
                className="text-[16px] font-semibold text-white hover:text-orange-300 transition-colors
                           text-left mb-3 block truncate w-full"
              >
                {empresa.nome}
              </button>
            )}
            {contatos.length === 0 && (
              <p className="text-[13px] text-slate-500 italic mb-4">
                {empresa ? 'Nenhum contato vinculado.' : 'Nenhuma empresa ou contato vinculado.'}
              </p>
            )}
            {contatos.map((c) => (
              <ContactCard key={c.id} contato={c} onAbrirContato={handleAbrirContato} />
            ))}

            <SectionTitle>Datas</SectionTitle>
            <div>
              <DateRow label="Último contato em"   value={o.ultimoContatoEm} />
              <DateRow label="Orçamento enviado em" value={o.orcamentoEnviadoEm} />
              <DateRow label="Fechamento esperado"  value={o.dataFechamentoEsperada} />
              <DateRow label="Próxima atividade"    value={o.proximaAtividade} isText accent />
              {(o.coluna === 'vendido' || o.coluna === 'sucesso') && (
                <>
                  <DateRow label="Vendido em"      value={o.vendidoEm} />
                  <DateRow label="Data de entrega" value={o.dataEntrega} />
                </>
              )}
              {o.coluna === 'perdido' && (
                <>
                  <DateRow label="Data da perda" value={o.dataPerda} />
                  {o.tipoObjecao && (
                    <div className="flex items-baseline justify-between py-2 border-b border-[#1f2937] last:border-b-0 gap-4">
                      <span className="text-[13px] text-slate-400 flex-shrink-0">Tipo de objeção</span>
                      <span className="text-[13px] text-red-300">{TIPO_OBJECAO_LABELS[o.tipoObjecao]}</span>
                    </div>
                  )}
                  {o.observacaoObjecao && (
                    <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/25">
                      <p className="text-[13px] text-red-300">{o.observacaoObjecao}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {(o.origem || o.campanhasOfertadas.length > 0) && (
              <div className="mt-6">
                <SectionTitle>Origem e Campanhas</SectionTitle>
                {o.origem && (
                  <div className="mb-3">
                    <p className="text-[11px] text-slate-500 mb-1.5">Origem</p>
                    <span className="inline-block px-2.5 py-1 rounded-md text-[12px] font-medium
                                     bg-slate-700/40 text-slate-300 border border-slate-600">
                      {ORIGEM_LABELS[o.origem]}
                    </span>
                  </div>
                )}
                {o.campanhasOfertadas.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[11px] text-slate-500 mb-1.5">Campanhas ofertadas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {o.campanhasOfertadas.map((c) => (
                        <span key={c} className="inline-block px-2.5 py-1 rounded-md text-[12px] font-medium
                                                  bg-orange-500/10 text-orange-300 border border-orange-500/25">
                          {CAMPANHA_LABELS[c]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {o.fechouPela && (
                  <div className="pt-3 border-t border-[#1f2937]">
                    <p className="text-[11px] text-slate-400 mb-1.5">Fechou pela campanha:</p>
                    <span className="inline-block px-2.5 py-1 rounded-md text-[12px] font-semibold
                                     bg-green-500/15 text-green-300 border border-green-500/30">
                      {CAMPANHA_LABELS[o.fechouPela]}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PANE DIREITO */}
          <div className="bg-card overflow-y-auto px-7 py-5 min-w-0">

            <SectionTitle>Cenário Atual</SectionTitle>
            <CenarioInlineEditable
              value={o.cenarioAtual}
              onChange={(texto) => updateOrcamento(o.id, { cenarioAtual: texto })}
            />

            <div className="mt-6">
              <SectionTitle>Itens de Ação</SectionTitle>
              {o.itensAcao.length === 0 && (
                <p className="text-[13px] text-slate-500 italic">Nenhum item ainda.</p>
              )}
              <div>
                {o.itensAcao.map((item) => (
                  <ActionItem
                    key={item.id}
                    item={item}
                    onToggle={(itemId) => toggleItemAcao(o.id, itemId)}
                    onDelete={(itemId) => deleteItemAcao(o.id, itemId)}
                  />
                ))}
              </div>
              <AddActionItem onAdd={(texto) => addItemAcao(o.id, texto)} />
            </div>

            <div className="mt-6">
              <SectionTitle>Histórico</SectionTitle>
              <div className="max-h-[300px] overflow-y-auto pr-1">
                {[...o.historico].reverse().map((entry, i, arr) => (
                  <HistoricoEntry key={i} entry={entry} isLast={i === arr.length - 1} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ───── INLINE PERDIDA ───── */}
        {showPerdida && (
          <div className="bg-red-950/20 border-t border-red-800/40 px-6 py-4 flex-shrink-0">
            <p className="text-[13px] text-red-400 font-semibold mb-3">Motivo da Perda</p>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {(['preco', 'prazo', 'concorrencia', 'sem_retorno'] as const).map((k) => (
                <label
                  key={k}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-[13px] ${
                    perdidaTipo === k
                      ? 'border-red-500 text-white bg-red-900/30'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    checked={perdidaTipo === k}
                    onChange={() => setPerdidaTipo(k)}
                    className="accent-red-500"
                  />
                  {TIPO_OBJECAO_LABELS[k]}
                </label>
              ))}
            </div>
            <div className="flex gap-3 items-center">
              <input
                className="input flex-1 text-[13px]"
                placeholder="Observação (opcional)"
                value={perdidaObs}
                onChange={(e) => setPerdidaObs(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePerdida()}
              />
              <button
                onClick={handlePerdida}
                className="bg-red-700 hover:bg-red-600 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Confirmar Perda
              </button>
              <button onClick={() => setShowPerdida(false)} className="btn-ghost text-[13px]">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* ───── FOOTER ───── */}
        <footer className="bg-[#1a2336] border-t border-slate-700 px-6 py-3.5 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleDelete}
            className="px-3.5 py-2.5 rounded-lg border border-red-500/40 text-red-300
                       hover:bg-red-500/10 hover:text-red-200 text-[14px] font-medium
                       transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Excluir
          </button>

          <div className="flex-1" />

          <button
            onClick={() => { close(); setModalEditar(o) }}
            className="btn-ghost flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar campos
          </button>

          {!isClosed && (
            <>
              <button
                onClick={() => setShowPerdida(!showPerdida)}
                className="px-5 py-2.5 rounded-lg border border-red-500/40 text-red-300
                           hover:bg-red-500/10 hover:text-red-200 text-[14px] font-medium transition-colors"
              >
                😢 Marcar como perdida
              </button>
              <button
                onClick={handleGanha}
                className="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white
                           text-[14px] font-semibold transition-colors
                           shadow-[0_4px_12px_rgba(34,197,94,0.25)]"
              >
                🏆 Marcar como ganha
              </button>
            </>
          )}

          {isClosed && (
            <p className="text-[13px] text-slate-400 italic">
              {o.coluna === 'vendido' || o.coluna === 'sucesso'
                ? 'Orçamento fechado como ganho.'
                : 'Orçamento marcado como perdido.'}
            </p>
          )}
        </footer>
      </div>
    </div>
  )
}
