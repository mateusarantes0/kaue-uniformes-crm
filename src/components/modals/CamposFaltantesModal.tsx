import { useState } from 'react'
import toast from 'react-hot-toast'
import { useOrcamentoStore } from '../../store/useOrcamentoStore'
import { useEmpresaStore } from '../../store/useEmpresaStore'
import { usePessoaStore } from '../../store/usePessoaStore'
import { useAuthStore } from '../../store/useAuthStore'
import {
  Coluna, Campanha, CondicaoPagamento, CAMPANHA_LABELS,
  CONDICAO_PAGAMENTO_LABELS, COLUNAS, CARGO_LABELS,
} from '../../types'
import { CurrencyInput } from '../ui/CurrencyInput'
import { SearchableSelect, SearchableItem } from '../ui/SearchableSelect'
import { validarMudancaColuna } from '../../lib/validacoesEtapa'

interface Props {
  orcamentoId: string
  colunaDestino: Coluna
  erros: string[]
  onClose: () => void
}

export function CamposFaltantesModal({ orcamentoId, colunaDestino, erros, onClose }: Props) {
  const orcamentos = useOrcamentoStore((s) => s.orcamentos)
  const updateOrcamento = useOrcamentoStore((s) => s.updateOrcamento)
  const moveOrcamento = useOrcamentoStore((s) => s.moveOrcamento)
  const setPendingMove = useOrcamentoStore((s) => s.setPendingMove)
  const setModalEditar = useOrcamentoStore((s) => s.setModalEditar)
  const empresas = useEmpresaStore((s) => s.empresas)
  const pessoas = usePessoaStore((s) => s.pessoas)
  const users = useAuthStore((s) => s.users)

  const orc = orcamentos.find((o) => o.id === orcamentoId)
  if (!orc) return null

  const [valor, setValor] = useState<number | undefined>(orc.valor)
  const [produto, setProduto] = useState(orc.produto ?? '')
  const [quantidade, setQuantidade] = useState(orc.quantidade?.toString() ?? '')
  const [dataEntregaDesejada, setDataEntregaDesejada] = useState(orc.dataEntregaDesejada ?? '')
  const [condicaoPagamento, setCondicaoPagamento] = useState<CondicaoPagamento | ''>(orc.condicaoPagamento ?? '')
  const [justificativa, setJustificativa] = useState(orc.justificativaQuantidadeMinima ?? '')
  const [fechouPela, setFechouPela] = useState<Campanha | ''>(orc.fechouPela ?? '')
  const [contatosIds, setContatosIds] = useState<string[]>(orc.contatosIds)
  const [responsavelId, setResponsavelId] = useState(orc.responsavelId)
  const [saving, setSaving] = useState(false)

  const needsNome = erros.some((e) => e.includes('Nome'))
  const needsEmpresa = erros.some((e) => e.includes('Empresa'))
  const needsContato = erros.some((e) => e.includes('contato'))
  const needsResponsavel = erros.some((e) => e.includes('Responsável'))
  const needsProduto = erros.some((e) => e.includes('Produto'))
  const needsQuantidade = erros.some((e) => e.includes('Quantidade') || e.includes('quantidade'))
  const needsDataEntrega = erros.some((e) => e.includes('entrega desejada'))
  const needsPagamento = erros.some((e) => e.includes('pagamento'))
  const needsJustificativa = erros.some((e) => e.includes('Justificativa'))
  const needsValor = erros.some((e) => e.includes('Valor'))
  const needsFechouPela = erros.some((e) => e.includes('fechamento'))
  const needsEmpresaDados = erros.some((e) => e.includes('Razão Social') || e.includes('CNPJ'))

  const handleSave = async () => {
    setSaving(true)

    const patch: Parameters<typeof updateOrcamento>[1] = {}
    if (needsValor) patch.valor = valor
    if (needsProduto) patch.produto = produto || undefined
    if (needsQuantidade) patch.quantidade = quantidade ? Number(quantidade) : undefined
    if (needsDataEntrega) patch.dataEntregaDesejada = dataEntregaDesejada || undefined
    if (needsPagamento) patch.condicaoPagamento = (condicaoPagamento as CondicaoPagamento) || undefined
    if (needsJustificativa) patch.justificativaQuantidadeMinima = justificativa || undefined
    if (needsFechouPela) patch.fechouPela = (fechouPela as Campanha) || undefined
    if (needsContato) patch.contatosIds = contatosIds
    if (needsResponsavel) patch.responsavelId = responsavelId

    await updateOrcamento(orcamentoId, patch)

    const updatedOrc = useOrcamentoStore.getState().orcamentos.find((o) => o.id === orcamentoId)
    const empresa = updatedOrc?.empresaId ? empresas.find((e) => e.id === updatedOrc.empresaId) : undefined
    const { ok, erros: errosRestantes } = validarMudancaColuna(updatedOrc ?? orc, colunaDestino, empresa)

    if (!ok) {
      toast.error(errosRestantes[0])
      setSaving(false)
      return
    }

    const modalDestinos: Coluna[] = ['objecao', 'perdido', 'lixo', 'vendido', 'despacho', 'sucesso']
    if (modalDestinos.includes(colunaDestino)) {
      if (colunaDestino === 'objecao') setPendingMove({ orcamentoId, colunaDestino, motivo: 'objecao' })
      else if (colunaDestino === 'perdido') setPendingMove({ orcamentoId, colunaDestino, motivo: 'perdido' })
      else if (colunaDestino === 'lixo') setPendingMove({ orcamentoId, colunaDestino, motivo: 'lixo' })
      else setPendingMove({ orcamentoId, colunaDestino, motivo: 'ganho' })
    } else {
      await moveOrcamento(orcamentoId, colunaDestino)
      toast.success(`Movido para ${COLUNAS.find((c) => c.id === colunaDestino)?.label}`)
    }

    setSaving(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[rgba(2,6,16,0.80)] animate-kaue-fade"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl w-full max-w-md shadow-2xl animate-kaue-rise p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-base font-semibold text-white">Campos Obrigatórios</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Preencha os campos abaixo para mover para{' '}
            <strong className="text-white">{COLUNAS.find((c) => c.id === colunaDestino)?.label}</strong>
          </p>
        </div>

        <div className="space-y-3">
          {needsContato && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Contato(s)</label>
              <SearchableSelect
                selected={contatosIds.map((id) => {
                  const p = pessoas.find((x) => x.id === id)
                  return p ? ({ id: p.id, nome: p.nome } as SearchableItem) : ({ id, nome: id } as SearchableItem)
                })}
                onAdd={(item) => setContatosIds((prev) => prev.includes(item.id) ? prev : [...prev, item.id])}
                onRemove={(id) => setContatosIds((prev) => prev.filter((x) => x !== id))}
                onSearch={(q) =>
                  pessoas
                    .filter((p) => p.nome.toLowerCase().includes(q.toLowerCase()))
                    .map((p) => ({ id: p.id, nome: p.nome, subtitle: p.cargo ? CARGO_LABELS[p.cargo] : undefined }))
                }
                placeholder="Buscar contato..."
                multi
              />
            </div>
          )}

          {needsResponsavel && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Responsável</label>
              <select className="input" value={responsavelId} onChange={(e) => setResponsavelId(e.target.value)}>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          )}

          {needsProduto && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Produto *</label>
              <input className="input" value={produto} onChange={(e) => setProduto(e.target.value)} placeholder="Ex: Uniforme Operacional" />
            </div>
          )}

          {needsQuantidade && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Quantidade *</label>
              <input className="input" type="number" min="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
            </div>
          )}

          {needsJustificativa && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Justificativa (qtd &lt; 10) *</label>
              <input className="input" value={justificativa} onChange={(e) => setJustificativa(e.target.value)} placeholder="Motivo para quantidade abaixo do mínimo..." />
            </div>
          )}

          {needsDataEntrega && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Data de Entrega Desejada *</label>
              <input className="input" type="date" value={dataEntregaDesejada} onChange={(e) => setDataEntregaDesejada(e.target.value)} />
            </div>
          )}

          {needsPagamento && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Condição de Pagamento *</label>
              <select className="input" value={condicaoPagamento} onChange={(e) => setCondicaoPagamento(e.target.value as CondicaoPagamento | '')}>
                <option value="">— Selecionar —</option>
                {(Object.entries(CONDICAO_PAGAMENTO_LABELS) as [CondicaoPagamento, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          )}

          {needsValor && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Valor (R$) *</label>
              <CurrencyInput value={valor} onChange={setValor} />
            </div>
          )}

          {needsFechouPela && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Fechou pela Campanha *</label>
              <select className="input" value={fechouPela} onChange={(e) => setFechouPela(e.target.value as Campanha | '')}>
                <option value="">— Nenhuma —</option>
                {(Object.entries(CAMPANHA_LABELS) as [Campanha, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          )}

          {needsEmpresaDados && (
            <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-700/40">
              <p className="text-xs text-amber-300">
                Complete Razão Social e CNPJ no cadastro da empresa antes de continuar.
              </p>
              <button
                onClick={() => { onClose(); if (orc.empresaId) { const e = empresas.find((x) => x.id === orc.empresaId); if (e) useEmpresaStore.getState().setModalEditar(e) } }}
                className="text-xs text-amber-400 underline mt-1"
              >
                Abrir empresa
              </button>
            </div>
          )}

          {(needsNome || needsEmpresa) && (
            <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-700/40">
              <p className="text-xs text-blue-300">
                {erros.filter((e) => e.includes('Nome') || e.includes('Empresa')).join(' · ')}
              </p>
              <button
                onClick={() => { onClose(); setModalEditar(orc) }}
                className="text-xs text-blue-400 underline mt-1"
              >
                Abrir orçamento completo
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="btn-ghost flex-1" disabled={saving}>Cancelar</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 btn-primary"
          >
            {saving ? 'Salvando...' : 'Salvar e Mover'}
          </button>
        </div>
      </div>
    </div>
  )
}
