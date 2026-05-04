import { useState } from 'react'
import toast from 'react-hot-toast'
import { useStore } from '../../store/useStore'
import { Orcamento, Origem, ORIGEM_LABELS } from '../../types'
import { ModalShell, Field } from './CreateModal'

interface Props { orcamento: Orcamento }

export function EditModal({ orcamento }: Props) {
  const updateOrcamento = useStore((s) => s.updateOrcamento)
  const setModalEditar = useStore((s) => s.setModalEditar)

  const [nome, setNome] = useState(orcamento.nome)
  const [origem, setOrigem] = useState<Origem | undefined>(orcamento.origem)
  const [valor, setValor] = useState(orcamento.valor?.toString() ?? '')
  const [orcamentoEnviadoEm, setOrcamentoEnviadoEm] = useState(orcamento.orcamentoEnviadoEm ?? '')
  const [dataFechamentoEsperada, setDataFechamentoEsperada] = useState(orcamento.dataFechamentoEsperada ?? '')
  const [proximaAtividade, setProximaAtividade] = useState(orcamento.proximaAtividade ?? '')
  const [probabilidade, setProbabilidade] = useState(orcamento.probabilidade?.toString() ?? '')

  const valid = nome.trim() !== ''

  const handleSave = () => {
    if (!valid) return
    updateOrcamento(orcamento.id, {
      nome: nome.trim(),
      origem,
      valor: valor ? Number(valor) : undefined,
      orcamentoEnviadoEm: orcamentoEnviadoEm || undefined,
      dataFechamentoEsperada: dataFechamentoEsperada || undefined,
      proximaAtividade: proximaAtividade || undefined,
      probabilidade: probabilidade ? Number(probabilidade) : undefined,
    })
    toast.success('Orçamento atualizado!')
    setModalEditar(null)
  }

  return (
    <ModalShell title={`Editar: ${orcamento.nome}`} onClose={() => setModalEditar(null)}>
      <div className="space-y-3">
        <Field label="Nome / Empresa *">
          <input autoFocus className="input" value={nome} onChange={(e) => setNome(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Origem">
            <select className="input" value={origem ?? ''} onChange={(e) => setOrigem(e.target.value as Origem || undefined)}>
              <option value="">— Não informado —</option>
              {(Object.entries(ORIGEM_LABELS) as [Origem, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
          <Field label="Valor (R$)">
            <input className="input" type="number" min="0" value={valor} onChange={(e) => setValor(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Envio do Orçamento">
            <input className="input" type="date" value={orcamentoEnviadoEm} onChange={(e) => setOrcamentoEnviadoEm(e.target.value)} />
          </Field>
          <Field label="Fechamento Esperado">
            <input className="input" type="date" value={dataFechamentoEsperada} onChange={(e) => setDataFechamentoEsperada(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Probabilidade (%)">
            <input className="input" type="number" min="0" max="100" value={probabilidade} onChange={(e) => setProbabilidade(e.target.value)} placeholder="0–100" />
          </Field>
          <Field label="Próxima Atividade">
            <input className="input" value={proximaAtividade} onChange={(e) => setProximaAtividade(e.target.value)} placeholder="Ex: Ligar amanhã" />
          </Field>
        </div>

        {orcamento.historico.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 mb-2 mt-2">Histórico</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {[...orcamento.historico].reverse().map((h, i) => (
                <div key={i} className="text-xs text-slate-400 bg-slate-800 rounded px-2 py-1">
                  <span className="text-slate-500">{new Date(h.data).toLocaleDateString('pt-BR')}</span> — {h.texto}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={() => setModalEditar(null)} className="btn-ghost">Cancelar</button>
          <button onClick={handleSave} disabled={!valid} className="btn-primary">Salvar Alterações</button>
        </div>
      </div>
    </ModalShell>
  )
}
