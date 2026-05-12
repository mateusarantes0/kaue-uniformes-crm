import { useState, KeyboardEvent } from 'react'
import toast from 'react-hot-toast'
import { usePessoaStore } from '../../store/usePessoaStore'
import { useEmpresaStore } from '../../store/useEmpresaStore'
import { useAuthStore } from '../../store/useAuthStore'
import {
  Pessoa, TipoContato, Cargo, GrauInfluencia, Sexo, SimNaoNA, UF, UFS,
  TIPO_CONTATO_LABELS, CARGO_LABELS, GRAU_INFLUENCIA_LABELS, SEXO_LABELS, SIM_NAO_NA_LABELS,
} from '../../types'
import { ModalShell, Field, Section } from './CreateModal'
import { maskWhatsApp, formatDateTime } from '../../utils'
import { SearchableSelect, SearchableItem } from '../ui/SearchableSelect'

interface Props {
  pessoa?: Pessoa
  onClose: () => void
  onCreated?: (p: Pessoa) => void
}

function tagColor(s: string): { bg: string; text: string } {
  let hash = 0
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash)
  const palette = [
    { bg: 'bg-blue-900/60', text: 'text-blue-300' },
    { bg: 'bg-green-900/60', text: 'text-green-300' },
    { bg: 'bg-purple-900/60', text: 'text-purple-300' },
    { bg: 'bg-amber-900/60', text: 'text-amber-300' },
    { bg: 'bg-pink-900/60', text: 'text-pink-300' },
    { bg: 'bg-teal-900/60', text: 'text-teal-300' },
    { bg: 'bg-orange-900/60', text: 'text-orange-300' },
    { bg: 'bg-cyan-900/60', text: 'text-cyan-300' },
  ]
  return palette[Math.abs(hash) % palette.length]
}

export function PessoaModal({ pessoa, onClose, onCreated }: Props) {
  const addPessoa    = usePessoaStore((s) => s.addPessoa)
  const updatePessoa = usePessoaStore((s) => s.updatePessoa)
  const empresas     = useEmpresaStore((s) => s.empresas)
  const users        = useAuthStore((s) => s.users)
  const isEdit = !!pessoa
  const p = pessoa

  const [nome, setNome]                         = useState(p?.nome ?? '')
  const [responsaveisIds, setResponsaveisIds]   = useState<string[]>(p?.responsaveisIds ?? [])
  const [telefone, setTelefone]                 = useState(p?.telefone ?? '')
  const [empresasIds, setEmpresasIds]           = useState<string[]>(p?.empresasIds ?? [])
  const [tipoContato, setTipoContato]           = useState<TipoContato | ''>(p?.tipoContato ?? '')
  const [cargo, setCargo]                       = useState<Cargo | ''>(p?.cargo ?? '')
  const [grauInfluencia, setGrauInfluencia]     = useState<GrauInfluencia | ''>(p?.grauInfluencia ?? '')
  const [email, setEmail]                       = useState(p?.email ?? '')
  const [instagram, setInstagram]               = useState(p?.instagram ?? '')
  const [linkedin, setLinkedin]                 = useState(p?.linkedin ?? '')
  const [etiquetas, setEtiquetas]               = useState<string[]>(p?.etiquetas ?? [])
  const [etiquetaInput, setEtiquetaInput]       = useState('')
  const [cpf, setCpf]                           = useState(p?.cpf ?? '')
  const [dataNascimento, setDataNascimento]     = useState(p?.dataNascimento ?? '')
  const [sexo, setSexo]                         = useState<Sexo | ''>(p?.sexo ?? '')
  const [endereco, setEndereco]                 = useState(p?.endereco ?? '')
  const [cidade, setCidade]                     = useState(p?.cidade ?? '')
  const [uf, setUf]                             = useState<UF | ''>(p?.uf ?? '')
  const [avaliouNoGoogle, setAvaliouNoGoogle]   = useState<SimNaoNA | ''>(p?.avaliouNoGoogle ?? '')
  const [pedimosIndicacao, setPedimosIndicacao] = useState<SimNaoNA | ''>(p?.pedimosIndicacao ?? '')
  const [indicacoes, setIndicacoes]             = useState(p?.indicacoes ?? '')
  const [saving, setSaving]                     = useState(false)

  const toggleResponsavel = (id: string) => {
    setResponsaveisIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const addEtiqueta = (valor: string) => {
    const tag = valor.trim().replace(/,$/, '').trim()
    if (tag && !etiquetas.includes(tag)) {
      setEtiquetas((prev) => [...prev, tag])
    }
    setEtiquetaInput('')
  }

  const handleEtiquetaKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addEtiqueta(etiquetaInput)
    }
    if (e.key === 'Backspace' && !etiquetaInput && etiquetas.length > 0) {
      setEtiquetas((prev) => prev.slice(0, -1))
    }
  }

  const removeEtiqueta = (tag: string) => setEtiquetas((prev) => prev.filter((t) => t !== tag))

  const handleSave = async () => {
    if (!nome.trim()) return
    setSaving(true)
    const data = {
      nome: nome.trim(),
      responsaveisIds,
      telefone: telefone || undefined,
      empresasIds,
      tipoContato: (tipoContato as TipoContato) || undefined,
      cargo: (cargo as Cargo) || undefined,
      grauInfluencia: (grauInfluencia as GrauInfluencia) || undefined,
      email: email || undefined,
      instagram: instagram || undefined,
      linkedin: linkedin || undefined,
      etiquetas,
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
      await updatePessoa(p.id, data)
      toast.success('Pessoa atualizada!')
      onClose()
    } else {
      const nova = await addPessoa(data)
      if (!nova) { setSaving(false); return }
      toast.success(`"${nova.nome}" criada!`)
      if (onCreated) onCreated(nova)
      else onClose()
    }
    setSaving(false)
  }

  const userName = (id: string) => users.find((u) => u.id === id)?.name ?? '—'

  return (
    <ModalShell title={isEdit ? `Editar: ${p?.nome}` : 'Nova Pessoa'} onClose={onClose} wide>
      <div className="space-y-3">
        {isEdit && p && (
          <div className="text-xs text-slate-500 flex flex-wrap gap-x-5 gap-y-0.5 -mt-1 mb-1">
            <span>Criado {formatDateTime(p.criadoEm)} por {userName(p.criadoPor)}</span>
            <span>Atualizado {formatDateTime(p.atualizadoEm)} por {userName(p.atualizadoPor)}</span>
          </div>
        )}
        <Section label="Identificação" />
        <Field label="Nome *">
          <input autoFocus className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
        </Field>
        <Field label="Responsáveis">
          <div className="flex gap-3 flex-wrap">
            {users.map((u) => (
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
          <Field label="Empresa(s)">
            <SearchableSelect
              selected={empresasIds.map((id) => {
                const emp = empresas.find((e) => e.id === id)
                return emp
                  ? ({ id: emp.id, nome: emp.nome, subtitle: emp.cnpj ? `CNPJ ${emp.cnpj}` : undefined } as SearchableItem)
                  : ({ id, nome: id } as SearchableItem)
              })}
              onAdd={(item) => setEmpresasIds((prev) => prev.includes(item.id) ? prev : [...prev, item.id])}
              onRemove={(id) => setEmpresasIds((prev) => prev.filter((x) => x !== id))}
              onSearch={(q) =>
                empresas
                  .filter((e) => e.nome.toLowerCase().includes(q.toLowerCase()))
                  .map((e) => ({ id: e.id, nome: e.nome, subtitle: e.cnpj ? `CNPJ ${e.cnpj}` : undefined }))
              }
              placeholder="Buscar empresa..."
              multi
            />
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

        {/* Etiquetas */}
        <Field label="Etiquetas">
          <div className="input flex flex-wrap gap-1.5 min-h-[38px] py-1.5 cursor-text"
            onClick={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}
          >
            {etiquetas.map((tag) => {
              const c = tagColor(tag)
              return (
                <span key={tag} className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${c.bg} ${c.text}`}>
                  {tag}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeEtiqueta(tag) }}
                    className="hover:opacity-70 leading-none"
                  >×</button>
                </span>
              )
            })}
            <input
              className="bg-transparent outline-none text-xs text-white min-w-[120px] flex-1"
              placeholder={etiquetas.length === 0 ? 'Adicionar etiqueta (Enter ou vírgula)' : ''}
              value={etiquetaInput}
              onChange={(e) => setEtiquetaInput(e.target.value)}
              onKeyDown={handleEtiquetaKeyDown}
              onBlur={() => etiquetaInput.trim() && addEtiqueta(etiquetaInput)}
            />
          </div>
        </Field>

        <Section label="Contato" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Telefone / WhatsApp">
            <input className="input" value={telefone} onChange={(e) => setTelefone(maskWhatsApp(e.target.value))} placeholder="(11) 99999-9999" inputMode="numeric" />
          </Field>
          <Field label="E-mail">
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Instagram">
            <input className="input" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@usuario" />
          </Field>
          <Field label="LinkedIn">
            <input className="input" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/usuario" />
          </Field>
        </div>

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
          <button onClick={onClose} className="btn-ghost" disabled={saving}>Cancelar</button>
          <button onClick={handleSave} disabled={!nome.trim() || saving} className="btn-primary">
            {saving ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Pessoa'}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
