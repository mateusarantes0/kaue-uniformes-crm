import { useState } from 'react'
import toast from 'react-hot-toast'
import { useStore } from '../../store/useStore'
import { Cliente, Origem, Prioridade, Etiqueta, ETIQUETA_CONFIG } from '../../types'
import { maskWhatsApp } from '../../utils'
import { ModalShell, Field } from './CreateModal'

const ORIGENS: { value: Origem; label: string }[] = [
  { value: 'whatsapp',   label: 'WhatsApp'    },
  { value: 'loja',       label: 'Loja Física' },
  { value: 'indicacao',  label: 'Indicação'   },
  { value: 'prospeccao', label: 'Prospecção'  },
  { value: 'instagram',  label: 'Instagram'   },
  { value: 'outros',     label: 'Outros'      },
]

const ETIQUETAS = Object.entries(ETIQUETA_CONFIG) as [Etiqueta, typeof ETIQUETA_CONFIG[Etiqueta]][]

interface Props { cliente: Cliente }

export function EditModal({ cliente }: Props) {
  const updateCliente = useStore((s) => s.updateCliente)
  const setModalEditar = useStore((s) => s.setModalEditar)

  const [nome, setNome] = useState(cliente.nome)
  const [whatsapp, setWhatsapp] = useState(cliente.whatsapp)
  const [origem, setOrigem] = useState<Origem>(cliente.origem)
  const [indicadoPor, setIndicadoPor] = useState(cliente.indicadoPor ?? '')
  const [responsavel, setResponsavel] = useState(cliente.responsavel)
  const [prioridade, setPrioridade] = useState<Prioridade>(cliente.prioridade)
  const [etiqueta, setEtiqueta] = useState<Etiqueta | undefined>(cliente.etiqueta)
  const [tipoUniforme, setTipoUniforme] = useState(cliente.tipoUniforme ?? '')
  const [qtdPecas, setQtdPecas] = useState(cliente.qtdPecas?.toString() ?? '')
  const [valorEstimado, setValorEstimado] = useState(cliente.valorEstimado?.toString() ?? '')
  const [prazo, setPrazo] = useState(cliente.prazo ?? '')
  const [dataEnvioOrcamento, setDataEnvioOrcamento] = useState(cliente.dataEnvioOrcamento ?? '')
  const [dataLancamentoSistema, setDataLancamentoSistema] = useState(cliente.dataLancamentoSistema ?? '')
  const [observacoes, setObservacoes] = useState(cliente.observacoes ?? '')

  const valid = nome.trim() && whatsapp.length >= 14 && responsavel.trim()

  const handleSave = () => {
    if (!valid) return
    updateCliente(cliente.id, {
      nome: nome.trim(),
      whatsapp,
      origem,
      indicadoPor: origem === 'indicacao' ? indicadoPor : undefined,
      responsavel: responsavel.trim(),
      prioridade,
      etiqueta,
      tipoUniforme: tipoUniforme || undefined,
      qtdPecas: qtdPecas ? Number(qtdPecas) : undefined,
      valorEstimado: valorEstimado ? Number(valorEstimado) : undefined,
      prazo: prazo || undefined,
      dataEnvioOrcamento: dataEnvioOrcamento || undefined,
      dataLancamentoSistema: dataLancamentoSistema || undefined,
      observacoes: observacoes || undefined,
    })
    toast.success('Cliente atualizado!')
    setModalEditar(null)
  }

  return (
    <ModalShell title={`Editar: ${cliente.nome}`} onClose={() => setModalEditar(null)}>
      <div className="space-y-3">
        <Section label="Identificação" />
        <Field label="Nome / Empresa *">
          <input autoFocus className="input" value={nome} onChange={(e) => setNome(e.target.value)} />
        </Field>
        <Field label="WhatsApp *">
          <input className="input" value={whatsapp} onChange={(e) => setWhatsapp(maskWhatsApp(e.target.value))} inputMode="numeric" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Origem *">
            <select className="input" value={origem} onChange={(e) => setOrigem(e.target.value as Origem)}>
              {ORIGENS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Prioridade">
            <select className="input" value={prioridade} onChange={(e) => setPrioridade(e.target.value as Prioridade)}>
              <option value="alta">🔴 Alta</option>
              <option value="media">🟡 Média</option>
              <option value="baixa">🟢 Baixa</option>
            </select>
          </Field>
        </div>
        {origem === 'indicacao' && (
          <Field label="Indicado por">
            <input className="input" value={indicadoPor} onChange={(e) => setIndicadoPor(e.target.value)} />
          </Field>
        )}
        <Field label="Responsável *">
          <input className="input" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
        </Field>

        {/* Etiquetas */}
        <Field label="Etiqueta">
          <div className="flex flex-wrap gap-2 pt-1">
            {ETIQUETAS.map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                onClick={() => setEtiqueta(etiqueta === key ? undefined : key)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  etiqueta === key ? `${cfg.bg} ${cfg.color} scale-105` : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </Field>

        <Section label="Detalhes do Pedido" />
        <Field label="Tipo de Uniforme">
          <input className="input" value={tipoUniforme} onChange={(e) => setTipoUniforme(e.target.value)} placeholder="Ex: Camisetas polo, aventais..." />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Qtd. de Peças">
            <input className="input" type="number" min="1" value={qtdPecas} onChange={(e) => setQtdPecas(e.target.value)} />
          </Field>
          <Field label="Valor Estimado (R$)">
            <input className="input" type="number" min="0" value={valorEstimado} onChange={(e) => setValorEstimado(e.target.value)} />
          </Field>
        </div>
        <Field label="Prazo desejado">
          <input className="input" value={prazo} onChange={(e) => setPrazo(e.target.value)} placeholder="Ex: 30 dias" />
        </Field>

        <Section label="Orçamento" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Lançamento no Sistema">
            <input className="input" type="date" value={dataLancamentoSistema} onChange={(e) => setDataLancamentoSistema(e.target.value)} />
          </Field>
          <Field label="Envio do Orçamento">
            <input className="input" type="date" value={dataEnvioOrcamento} onChange={(e) => setDataEnvioOrcamento(e.target.value)} />
          </Field>
        </div>

        <Field label="Observações">
          <textarea className="input resize-none" rows={3} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
        </Field>

        {cliente.historico.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 mb-2 mt-2">Histórico</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {[...cliente.historico].reverse().map((h, i) => (
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

function Section({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold text-accent uppercase tracking-wider pt-1 border-t border-slate-700">
      {label}
    </p>
  )
}
