import { useState } from 'react'
import toast from 'react-hot-toast'
import { useStore } from '../../store/useStore'
import { Origem, Prioridade, Coluna, Etiqueta, ETIQUETA_CONFIG } from '../../types'
import { maskWhatsApp } from '../../utils'

interface CreateModalProps {
  defaultColuna?: Coluna
}

const ORIGENS: { value: Origem; label: string }[] = [
  { value: 'whatsapp',   label: 'WhatsApp'    },
  { value: 'loja',       label: 'Loja Física' },
  { value: 'indicacao',  label: 'Indicação'   },
  { value: 'prospeccao', label: 'Prospecção'  },
  { value: 'instagram',  label: 'Instagram'   },
  { value: 'outros',     label: 'Outros'      },
]

const ETIQUETAS = Object.entries(ETIQUETA_CONFIG) as [Etiqueta, typeof ETIQUETA_CONFIG[Etiqueta]][]

export function CreateModal({ defaultColuna = 'lead' }: CreateModalProps) {
  const addCliente = useStore((s) => s.addCliente)
  const setModalCriar = useStore((s) => s.setModalCriar)

  const [step, setStep] = useState(1)
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [origem, setOrigem] = useState<Origem>('whatsapp')
  const [indicadoPor, setIndicadoPor] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [prioridade, setPrioridade] = useState<Prioridade>('media')
  const [etiqueta, setEtiqueta] = useState<Etiqueta>('lead')
  const [coluna, setColuna] = useState<Coluna>(defaultColuna)

  // Step 2
  const [tipoUniforme, setTipoUniforme] = useState('')
  const [qtdPecas, setQtdPecas] = useState('')
  const [valorEstimado, setValorEstimado] = useState('')
  const [prazo, setPrazo] = useState('')
  const [dataEnvioOrcamento, setDataEnvioOrcamento] = useState('')
  const [dataLancamentoSistema, setDataLancamentoSistema] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const valid1 = nome.trim() && whatsapp.length >= 14 && responsavel.trim()

  const handleSave = () => {
    if (!valid1) return
    addCliente({
      nome: nome.trim(),
      whatsapp,
      origem,
      indicadoPor: origem === 'indicacao' ? indicadoPor : undefined,
      responsavel: responsavel.trim(),
      prioridade,
      etiqueta,
      coluna,
      tipoUniforme: tipoUniforme || undefined,
      qtdPecas: qtdPecas ? Number(qtdPecas) : undefined,
      valorEstimado: valorEstimado ? Number(valorEstimado) : undefined,
      prazo: prazo || undefined,
      dataEnvioOrcamento: dataEnvioOrcamento || undefined,
      dataLancamentoSistema: dataLancamentoSistema || undefined,
      observacoes: observacoes || undefined,
    })
    toast.success(`"${nome}" adicionado com sucesso!`)
    setModalCriar(false)
  }

  return (
    <ModalShell title="Novo Cliente" onClose={() => setModalCriar(false)}>
      <div className="flex border-b border-slate-700 mb-4">
        {['Identificação', 'Pedido'].map((label, i) => (
          <button
            key={i}
            onClick={() => (i === 1 && valid1 ? setStep(2) : setStep(1))}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              step === i + 1 ? 'text-accent border-b-2 border-accent' : 'text-slate-400 hover:text-white'
            }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <Field label="Nome / Empresa *">
            <input autoFocus className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Padaria Pão de Ouro" />
          </Field>
          <Field label="WhatsApp *">
            <input className="input" value={whatsapp} onChange={(e) => setWhatsapp(maskWhatsApp(e.target.value))} placeholder="(11) 99999-9999" inputMode="numeric" />
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
              <input className="input" value={indicadoPor} onChange={(e) => setIndicadoPor(e.target.value)} placeholder="Nome de quem indicou" />
            </Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Responsável *">
              <input className="input" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder="Seu nome" />
            </Field>
            <Field label="Coluna inicial">
              <select className="input" value={coluna} onChange={(e) => setColuna(e.target.value as Coluna)}>
                <option value="lead">Lead</option>
                <option value="qualificacao">Qualificação</option>
                <option value="orcamento">Orçamento Enviado</option>
                <option value="negociacao">Negociação</option>
                <option value="aguardando">Aguardando</option>
              </select>
            </Field>
          </div>
          {/* Etiquetas */}
          <Field label="Etiqueta">
            <div className="flex flex-wrap gap-2 pt-1">
              {ETIQUETAS.map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setEtiqueta(key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    etiqueta === key ? `${cfg.bg} ${cfg.color} scale-105` : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalCriar(false)} className="btn-ghost">Cancelar</button>
            <button onClick={() => setStep(2)} disabled={!valid1} className="btn-secondary">Detalhes →</button>
            <button onClick={handleSave} disabled={!valid1} className="btn-primary">Salvar</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <Field label="Tipo de Uniforme">
            <input className="input" value={tipoUniforme} onChange={(e) => setTipoUniforme(e.target.value)} placeholder="Ex: Camisetas polo, aventais..." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Qtd. de Peças">
              <input className="input" type="number" min="1" value={qtdPecas} onChange={(e) => setQtdPecas(e.target.value)} placeholder="0" />
            </Field>
            <Field label="Valor Estimado (R$)">
              <input className="input" type="number" min="0" value={valorEstimado} onChange={(e) => setValorEstimado(e.target.value)} placeholder="0" />
            </Field>
          </div>
          <Field label="Prazo desejado">
            <input className="input" value={prazo} onChange={(e) => setPrazo(e.target.value)} placeholder="Ex: 30 dias" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Lançamento no Sistema">
              <input className="input" type="date" value={dataLancamentoSistema} onChange={(e) => setDataLancamentoSistema(e.target.value)} />
            </Field>
            <Field label="Envio do Orçamento">
              <input className="input" type="date" value={dataEnvioOrcamento} onChange={(e) => setDataEnvioOrcamento(e.target.value)} />
            </Field>
          </div>
          <Field label="Observações">
            <textarea className="input resize-none" rows={3} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Detalhes adicionais..." />
          </Field>
          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(1)} className="btn-ghost">← Voltar</button>
            <button onClick={handleSave} className="btn-primary">Salvar Cliente</button>
          </div>
        </div>
      )}
    </ModalShell>
  )
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      {children}
    </div>
  )
}

export function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1E293B] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-white font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
