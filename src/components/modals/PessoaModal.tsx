import { useState } from 'react'
import toast from 'react-hot-toast'
import { usePessoaStore } from '../../store/usePessoaStore'
import { useEmpresaStore } from '../../store/useEmpresaStore'
import {
  Pessoa, TipoContato, Cargo, GrauInfluencia, Sexo, SimNaoNA, UF, UFS,
  TIPO_CONTATO_LABELS, CARGO_LABELS, GRAU_INFLUENCIA_LABELS, SEXO_LABELS, SIM_NAO_NA_LABELS,
} from '../../types'
import { ModalShell, Field, Section } from './CreateModal'
import { maskWhatsApp } from '../../utils'

const USERS = [
  { id: 'admin', name: 'Admin' },
  { id: 'noemi', name: 'Noemi' },
  { id: 'dione', name: 'Dione' },
]

interface Props {
  pessoa?: Pessoa
  onClose: () => void
  onCreated?: (p: Pessoa) => void
}

export function PessoaModal({ pessoa, onClose, onCreated }: Props) {
  const addPessoa = usePessoaStore((s) => s.addPessoa)
  const updatePessoa = usePessoaStore((s) => s.updatePessoa)
  const empresas = useEmpresaStore((s) => s.empresas)
  const isEdit = !!pessoa
  const p = pessoa

  const [nome, setNome] = useState(p?.nome ?? '')
  const [responsaveisIds, setResponsaveisIds] = useState<string[]>(p?.responsaveisIds ?? [])
  const [telefone, setTelefone] = useState(p?.telefone ?? '')
  const [empresaId, setEmpresaId] = useState(p?.empresaId ?? '')
  const [tipoContato, setTipoContato] = useState<TipoContato | ''>(p?.tipoContato ?? '')
  const [cargo, setCargo] = useState<Cargo | ''>(p?.cargo ?? '')
  const [grauInfluencia, setGrauInfluencia] = useState<GrauInfluencia | ''>(p?.grauInfluencia ?? '')
  const [email, setEmail] = useState(p?.email ?? '')
  const [instagram, setInstagram] = useState(p?.instagram ?? '')
  const [cpf, setCpf] = useState(p?.cpf ?? '')
  const [dataNascimento, setDataNascimento] = useState(p?.dataNascimento ?? '')
  const [sexo, setSexo] = useState<Sexo | ''>(p?.sexo ?? '')
  const [endereco, setEndereco] = useState(p?.endereco ?? '')
  const [cidade, setCidade] = useState(p?.cidade ?? '')
  const [uf, setUf] = useState<UF | ''>(p?.uf ?? '')
  const [avaliouNoGoogle, setAvaliouNoGoogle] = useState<SimNaoNA | ''>(p?.avaliouNoGoogle ?? '')
  const [pedimosIndicacao, setPedimosIndicacao] = useState<SimNaoNA | ''>(p?.pedimosIndicacao ?? '')
  const [indicacoes, setIndicacoes] = useState(p?.indicacoes ?? '')

  const toggleResponsavel = (id: string) => {
    setResponsaveisIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const handleSave = () => {
    if (!nome.trim()) return
    const data = {
      nome: nome.trim(),
      responsaveisIds,
      telefone: telefone || undefined,
      empresaId: empresaId || undefined,
      tipoContato: (tipoContato as TipoContato) || undefined,
      cargo: (cargo as Cargo) || undefined,
      grauInfluencia: (grauInfluencia as GrauInfluencia) || undefined,
      email: email || undefined,
      instagram: instagram || undefined,
      cpf: cpf || undefined,
      dataNascimento: dataNascimento || undefined,
      sexo: (sexo as Sexo) || undefined,
      endereco: endereco || undefined,
      cidade: cidade || undefined,
      uf: (uf as UF) || undefined,
      avaliouNoGoogle: (avaliouNoGoogle as SimNaoNA) || undefined,
      pedimosIndicacao: (pedimosIndicacao as SimNaoNA) || undefined,
      indicacoes: indicacoes || undefined,
    }
    if (isEdit && p) {
      updatePessoa(p.id, data)
      toast.success('Pessoa atualizada!')
      onClose()
    } else {
      const nova = addPessoa(data)
      toast.success(`"${nova.nome}" criada!`)
      if (onCreated) onCreated(nova)
      else onClose()
    }
  }

  return (
    <ModalShell title={isEdit ? `Editar: ${p?.nome}` : 'Nova Pessoa'} onClose={onClose} wide>
      <div className="space-y-3">
        <Section label="Identificação" />
        <Field label="Nome *">
          <input autoFocus className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
        </Field>
        <Field label="Responsáveis">
          <div className="flex gap-3">
            {USERS.map((u) => (
              <label key={u.id} className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={responsaveisIds.includes(u.id)}
                  onChange={() => toggleResponsavel(u.id)}
                  className="accent-amber-500"
                />
                {u.name}
              </label>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Empresa">
            <select className="input" value={empresaId} onChange={(e) => setEmpresaId(e.target.value)}>
              <option value="">— Nenhuma —</option>
              {empresas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
          </Field>
          <Field label="Tipo de Contato">
            <select className="input" value={tipoContato} onChange={(e) => setTipoContato(e.target.value as TipoContato | '')}>
              <option value="">— Selecionar —</option>
              {(Object.entries(TIPO_CONTATO_LABELS) as [TipoContato, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cargo">
            <select className="input" value={cargo} onChange={(e) => setCargo(e.target.value as Cargo | '')}>
              <option value="">— Selecionar —</option>
              {(Object.entries(CARGO_LABELS) as [Cargo, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
          <Field label="Grau de Influência">
            <select className="input" value={grauInfluencia} onChange={(e) => setGrauInfluencia(e.target.value as GrauInfluencia | '')}>
              <option value="">— Selecionar —</option>
              {(Object.entries(GRAU_INFLUENCIA_LABELS) as [GrauInfluencia, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
        </div>

        <Section label="Contato" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Telefone / WhatsApp">
            <input className="input" value={telefone} onChange={(e) => setTelefone(maskWhatsApp(e.target.value))} placeholder="(11) 99999-9999" inputMode="numeric" />
          </Field>
          <Field label="E-mail">
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
          </Field>
        </div>
        <Field label="Instagram">
          <input className="input" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@usuario" />
        </Field>

        <Section label="Pessoal" />
        <div className="grid grid-cols-3 gap-3">
          <Field label="CPF">
            <input className="input" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
          </Field>
          <Field label="Data de Nascimento">
            <input className="input" type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
          </Field>
          <Field label="Sexo">
            <select className="input" value={sexo} onChange={(e) => setSexo(e.target.value as Sexo | '')}>
              <option value="">—</option>
              {(Object.entries(SEXO_LABELS) as [Sexo, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
        </div>

        <Section label="Endereço" />
        <Field label="Endereço">
          <input className="input" value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, número, bairro" />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Field label="Cidade">
              <input className="input" value={cidade} onChange={(e) => setCidade(e.target.value)} />
            </Field>
          </div>
          <Field label="UF">
            <select className="input" value={uf} onChange={(e) => setUf(e.target.value as UF | '')}>
              <option value="">—</option>
              {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </Field>
        </div>

        <Section label="Pós-venda" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Avaliou no Google?">
            <select className="input" value={avaliouNoGoogle} onChange={(e) => setAvaliouNoGoogle(e.target.value as SimNaoNA | '')}>
              <option value="">—</option>
              {(Object.entries(SIM_NAO_NA_LABELS) as [SimNaoNA, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
          <Field label="Pedimos Indicação?">
            <select className="input" value={pedimosIndicacao} onChange={(e) => setPedimosIndicacao(e.target.value as SimNaoNA | '')}>
              <option value="">—</option>
              {(Object.entries(SIM_NAO_NA_LABELS) as [SimNaoNA, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Indicações">
          <textarea className="input resize-none" rows={2} value={indicacoes} onChange={(e) => setIndicacoes(e.target.value)} placeholder="Quem esta pessoa já indicou..." />
        </Field>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="btn-ghost">Cancelar</button>
          <button onClick={handleSave} disabled={!nome.trim()} className="btn-primary">
            {isEdit ? 'Salvar Alterações' : 'Criar Pessoa'}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
