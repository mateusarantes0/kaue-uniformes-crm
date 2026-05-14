import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useOrcamentoStore } from '../../store/useOrcamentoStore'
import { useEmpresaStore } from '../../store/useEmpresaStore'
import { usePessoaStore } from '../../store/usePessoaStore'
import {
  Coluna, TipoObjecao, Campanha,
  ORIGEM_LABELS, CAMPANHA_LABELS, TIPO_OBJECAO_LABELS, COLUNA_LABELS, COLUNAS,
  CONDICAO_PAGAMENTO_LABELS, CONDICAO_PARCELAMENTO_LABELS,
} from '../../types'
import { formatCurrency, diasDesde, formatDateTime } from '../../utils'
import { useAuthStore } from '../../store/useAuthStore'
import { StageBadge } from '../orcamento/StageBadge'
import { ContactCard } from '../orcamento/ContactCard'
import { DateRow } from '../orcamento/DateRow'
import { ComentariosChat } from '../orcamento/ComentariosChat'
import { AtividadesLista } from '../orcamento/AtividadesLista'
import { ActionItem } from '../orcamento/ActionItem'
import { AddActionItem } from '../orcamento/AddActionItem'
import { HistoricoEntry } from '../orcamento/HistoricoEntry'
import { FecharNegocioModal } from './FecharNegocioModal'
import { validarMudancaColuna } from '../../lib/validacoesEtapa'

const CLOSED_COLS: Coluna[] = ['vendido', 'despacho', 'sucesso', 'perdido']

const TRAIL_STAGES: Coluna[] = [
  'lead', 'qualificacao', 'orcamento_enviado', 'negociacao', 'objecao', 'aguardando', 'vendido', 'despacho', 'sucesso',
]

const TRAIL_LABELS: Partial<Record<Coluna, string>> = {
  lead: 'Lead', qualificacao: 'Qualif.', orcamento_enviado: 'Orç.', negociacao: 'Negoc.',
  objecao: 'Objeção', aguardando: 'Aguard.', vendido: 'Vendido', despacho: 'Despacho', sucesso: 'Sucesso',
}

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
  const moveOrcamento     = useOrcamentoStore((s) => s.moveOrcamento)
  const setPendingMove    = useOrcamentoStore((s) => s.setPendingMove)
  const marcarComoGanha   = useOrcamentoStore((s) => s.marcarComoGanha)
  const marcarComoPerdida = useOrcamentoStore((s) => s.marcarComoPerdida)
  const deleteOrcamento   = useOrcamentoStore((s) => s.deleteOrcamento)
  const addItemAcao       = useOrcamentoStore((s) => s.addItemAcao)
  const toggleItemAcao    = useOrcamentoStore((s) => s.toggleItemAcao)
  const deleteItemAcao    = useOrcamentoStore((s) => s.deleteItemAcao)

  const empresas              = useEmpresaStore((s) => s.empresas)
  const setEmpresaModalEditar = useEmpresaStore((s) => s.setModalEditar)
  const pessoas              = usePessoaStore((s) => s.pessoas)
  const setPessoaModalEditar  = usePessoaStore((s) => s.setModalEditar)
  const users                = useAuthStore((s) => s.users)

  const [showPerdida,  setShowPerdida]  = useState(false)
  const [perdidaTipo,  setPerdidaTipo]  = useState<TipoObjecao>('preco')
  const [perdidaObs,   setPerdidaObs]   = useState('')
  const [showFecharNegocio, setShowFecharNegocio] = useState(false)
  const [camposFaltantes, setCamposFaltantes] = useState<{ colunaDestino: Coluna; erros: string[] } | null>(null)
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin')

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
  const userName = (id: string) => users.find((u) => u.id === id)?.name ?? '—'

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

  const handleFecharNegocio = (result: 'vendido' | 'perdido', fechouPela?: Campanha, tipoObj?: TipoObjecao, obs?: string) => {
    setShowFecharNegocio(false)
    if (result === 'vendido') {
      marcarComoGanha(o.id, fechouPela)
      toast.success('🏆 Orçamento fechado como ganho!')
    } else {
      marcarComoPerdida(o.id, tipoObj!, obs)
      toast('😢 Orçamento marcado como perdido')
    }
    close()
  }

  const handleTrailClick = (destino: Coluna) => {
    if (destino === o.coluna) return
    const empresa = o.empresaId ? empresas.find((e) => e.id === o.empresaId) : undefined
    const modalDestinos: Coluna[] = ['objecao', 'perdido', 'lixo', 'vendido', 'despacho', 'sucesso']

    if (!modalDestinos.includes(destino)) {
      const { ok, erros } = validarMudancaColuna(o, destino, empresa)
      if (!ok) {
        setCamposFaltantes({ colunaDestino: destino, erros })
        return
      }
      moveOrcamento(o.id, destino)
      toast.success(`Movido para ${COLUNA_LABELS[destino]}`)
      return
    }

    if (destino === 'objecao') {
      close(); setPendingMove({ orcamentoId: o.id, colunaDestino: 'objecao', motivo: 'objecao' })
    } else if (destino === 'vendido' || destino === 'despacho' || destino === 'sucesso') {
      const { ok, erros } = validarMudancaColuna(o, destino, empresa)
      if (!ok) { setCamposFaltantes({ colunaDestino: destino, erros }); return }
      close(); setPendingMove({ orcamentoId: o.id, colunaDestino: destino, motivo: 'ganho' })
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
            {o.valorSinal != null && o.valorSinal > 0 && o.valor != null && (
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">Restante</p>
                <p className="font-mono text-[18px] font-semibold text-amber-300 leading-tight">
                  {formatCurrency(o.valor - o.valorSinal)}
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

          {/* Trilha de etapas */}
          <div className="mt-4 flex items-center gap-0 overflow-x-auto">
            {TRAIL_STAGES.map((stage, idx) => {
              const currentIdx = TRAIL_STAGES.indexOf(o.coluna)
              const isPast    = idx < currentIdx
              const isCurrent = stage === o.coluna
              const isFuture  = idx > currentIdx
              return (
                <button
                  key={stage}
                  onClick={() => handleTrailClick(stage)}
                  title={COLUNA_LABELS[stage]}
                  className={[
                    'flex items-center gap-0 flex-shrink-0 text-[11px] font-medium transition-colors px-2 py-1 rounded',
                    isCurrent ? 'text-accent underline underline-offset-2 decoration-2' : '',
                    isPast ? 'text-green-400 hover:text-green-300' : '',
                    isFuture ? 'text-slate-500 hover:text-slate-300' : '',
                  ].join(' ')}
                >
                  {isPast && <span className="mr-0.5 text-green-500">✓</span>}
                  {TRAIL_LABELS[stage]}
                  {idx < TRAIL_STAGES.length - 1 && (
                    <span className="ml-1 text-slate-600">›</span>
                  )}
                </button>
              )
            })}
            <span className="mx-2 text-slate-600">|</span>
            {!isClosed && (
              <button
                onClick={() => setShowFecharNegocio(true)}
                className="flex-shrink-0 text-[11px] font-semibold px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
              >
                Fechar Negócio
              </button>
            )}
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
              {(o.coluna === 'vendido' || o.coluna === 'despacho' || o.coluna === 'sucesso') && (
                <>
                  <DateRow label="Vendido em"      value={o.vendidoEm} />
                  {o.despachadoEm && <DateRow label="Despachado em"  value={o.despachadoEm} />}
                  {(o.dataSaida || o.dataEntrega) && (
                    <div className="flex items-baseline justify-between py-2 border-b border-[#1f2937] last:border-b-0 gap-4">
                      <span className="text-[13px] text-slate-400 flex-shrink-0">Entrega</span>
                      <span className="text-[13px] text-white">
                        {o.dataSaida ? `Saída: ${new Date(o.dataSaida + 'T12:00:00').toLocaleDateString('pt-BR')}` : ''}
                        {o.dataSaida && o.dataEntrega ? ' → ' : ''}
                        {o.dataEntrega ? `Prev: ${new Date(o.dataEntrega + 'T12:00:00').toLocaleDateString('pt-BR')}` : ''}
                      </span>
                    </div>
                  )}
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

            {(o.origem || o.campanhaOfertada) && (
              <div className="mt-6">
                <SectionTitle>Origem e Campanha</SectionTitle>
                {o.origem && (
                  <div className="mb-3">
                    <p className="text-[11px] text-slate-500 mb-1.5">Origem</p>
                    <span className="inline-block px-2.5 py-1 rounded-md text-[12px] font-medium
                                     bg-slate-700/40 text-slate-300 border border-slate-600">
                      {ORIGEM_LABELS[o.origem]}
                    </span>
                  </div>
                )}
                {o.campanhaOfertada && (
                  <div className="mb-3">
                    <p className="text-[11px] text-slate-500 mb-1.5">Campanha ofertada</p>
                    <span className="inline-block px-2.5 py-1 rounded-md text-[12px] font-medium
                                     bg-orange-500/10 text-orange-300 border border-orange-500/25">
                      {CAMPANHA_LABELS[o.campanhaOfertada]}
                    </span>
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
          <div className="bg-card overflow-y-auto px-7 py-5 min-w-0 flex flex-col">

            <div className="flex-1 min-h-0 flex flex-col">
              <SectionTitle>Comentários</SectionTitle>
              <div className="flex-1 min-h-0" style={{ minHeight: 240 }}>
                <ComentariosChat orcamentoId={o.id} />
              </div>
            </div>

            <div className="mt-6 flex-shrink-0">
              <SectionTitle>Atividades</SectionTitle>
              <AtividadesLista orcamentoId={o.id} />
            </div>

            <div className="mt-6 flex-shrink-0">
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

            <div className="mt-6 flex-shrink-0">
              <SectionTitle>Histórico</SectionTitle>
              <div className="max-h-[300px] overflow-y-auto pr-1">
                {[...o.historico].reverse().map((entry, i, arr) => (
                  <HistoricoEntry key={i} entry={entry} isLast={i === arr.length - 1} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ───── FOOTER ───── */}
        <footer className="bg-[#1a2336] border-t border-slate-700 px-6 py-3.5 flex items-center gap-3 flex-shrink-0">
          <div className="text-[11px] text-slate-500 flex-shrink-0 leading-5 hidden sm:block">
            <div>Criado {formatDateTime(o.criadoEm)} por {userName(o.criadoPor)}</div>
            <div>Atualizado {formatDateTime(o.atualizadoEm)} por {userName(o.atualizadoPor)}</div>
          </div>

          {isAdmin && (
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
          )}

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

          {isClosed && (
            <p className="text-[13px] text-slate-400 italic">
              {['vendido', 'despacho', 'sucesso'].includes(o.coluna)
                ? 'Orçamento fechado como ganho.'
                : 'Orçamento marcado como perdido.'}
            </p>
          )}
        </footer>
      </div>

      {showFecharNegocio && (
        <FecharNegocioModal
          onVendido={(fechouPela) => handleFecharNegocio('vendido', fechouPela)}
          onPerdido={(tipo, obs) => handleFecharNegocio('perdido', undefined, tipo, obs)}
          onCancel={() => setShowFecharNegocio(false)}
        />
      )}

      {camposFaltantes && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[rgba(2,6,16,0.80)]"
          onClick={() => setCamposFaltantes(null)}
        >
          <div
            className="bg-card rounded-xl w-full max-w-md shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-base font-semibold text-white">Campos Obrigatórios</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Corrija os campos antes de mover para{' '}
                <strong className="text-white">{COLUNA_LABELS[camposFaltantes.colunaDestino]}</strong>:
              </p>
            </div>
            <ul className="space-y-1.5">
              {camposFaltantes.erros.map((err, i) => (
                <li key={i} className="text-[13px] text-red-300">• {err}</li>
              ))}
            </ul>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setCamposFaltantes(null)} className="btn-ghost flex-1">Cancelar</button>
              <button
                onClick={() => {
                  const dest = camposFaltantes.colunaDestino
                  const errs = camposFaltantes.erros
                  setCamposFaltantes(null)
                  close()
                  setModalEditar(o)
                  useOrcamentoStore.getState().setValidationErrors(errs)
                  useOrcamentoStore.getState().setPendingCamposFaltantes({ orcamentoId: o.id, colunaDestino: dest, erros: errs })
                }}
                className="flex-1 btn-primary"
              >
                Editar Campos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
