import { useState } from 'react'
import toast from 'react-hot-toast'
import { useStore } from '../../store/useStore'
import { Origem, Coluna, ORIGEM_LABELS, COLUNAS } from '../../types'

interface CreateModalProps {
  defaultColuna?: Coluna
}

export function CreateModal({ defaultColuna = 'lead' }: CreateModalProps) {
  const addOrcamento = useStore((s) => s.addOrcamento)
  const setModalCriar = useStore((s) => s.setModalCriar)

  const [nome, setNome] = useState('')
  const [origem, setOrigem] = useState<Origem>('whatsapp')
  const [valor, setValor] = useState('')
  const [orcamentoEnviadoEm, setOrcamentoEnviadoEm] = useState('')
  const [coluna, setColuna] = useState<Coluna>(defaultColuna)

  const valid = nome.trim() !== ''

  const handleSave = () => {
    if (!valid) return
    addOrcamento({
      nome: nome.trim(),
      origem,
      valor: valor ? Number(valor) : undefined,
      orcamentoEnviadoEm: orcamentoEnviadoEm || undefined,
      coluna,
      contatosIds: [],
      responsavelId: '',
    })
    toast.success(`"${nome}" adicionado com sucesso!`)
    setModalCriar(false)
  }

  const colunaOptions = COLUNAS.filter((c) =>
    ['lead', 'qualificacao', 'orcamento_enviado', 'negociacao', 'aguardando'].includes(c.id)
  )

  return (
    <ModalShell title="Novo Orçamento" onClose={() => setModalCriar(false)}>
      <div className="space-y-3">
        <Field label="Nome / Empresa *">
          <input autoFocus className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Padaria Pão de Ouro" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Origem">
            <select className="input" value={origem} onChange={(e) => setOrigem(e.target.value as Origem)}>
              {(Object.entries(ORIGEM_LABELS) as [Origem, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
          <Field label="Coluna inicial">
            <select className="input" value={coluna} onChange={(e) => setColuna(e.target.value as Coluna)}>
              {colunaOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Valor (R$)">
            <input className="input" type="number" min="0" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0" />
          </Field>
          <Field label="Envio do Orçamento">
            <input className="input" type="date" value={orcamentoEnviadoEm} onChange={(e) => setOrcamentoEnviadoEm(e.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={() => setModalCriar(false)} className="btn-ghost">Cancelar</button>
          <button onClick={handleSave} disabled={!valid} className="btn-primary">Salvar</button>
        </div>
      </div>
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
