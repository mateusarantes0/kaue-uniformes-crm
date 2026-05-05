import { useState } from 'react'
import toast from 'react-hot-toast'
import { useEmpresaStore } from '../../store/useEmpresaStore'
import { usePessoaStore } from '../../store/usePessoaStore'
import { useOrcamentoStore } from '../../store/useOrcamentoStore'
import {
  Empresa, Segmento, TipoCliente, GrupoEstrategico, Frequencia, StatusCliente, PorteEmpresa, UF, UFS,
  SEGMENTO_LABELS, TIPO_CLIENTE_LABELS, GRUPO_ESTRATEGICO_LABELS, FREQUENCIA_LABELS,
  STATUS_CLIENTE_LABELS, PORTE_EMPRESA_LABELS, CARGO_LABELS, COLUNA_LABELS,
} from '../../types'
import { ModalShell, Field, Section } from './CreateModal'
import { formatCurrency } from '../../utils'

const USERS = [
  { id: 'admin', name: 'Admin' },
  { id: 'noemi', name: 'Noemi' },
  { id: 'dione', name: 'Dione' },
]

interface Props {
  empresa?: Empresa
  onClose: () => void
  onCreated?: (e: Empresa) => void
}

export function EmpresaModal({ empresa, onClose, onCreated }: Props) {
  const addEmpresa = useEmpresaStore((s) => s.addEmpresa)
  const updateEmpresa = useEmpresaStore((s) => s.updateEmpresa)
  const pessoas = usePessoaStore((s) => s.pessoas)
  const setPessoaModalEditar = usePessoaStore((s) => s.setModalEditar)
  const orcamentos = useOrcamentoStore((s) => s.orcamentos)
  const setOrcDetalheId = useOrcamentoStore((s) => s.setModalDetalheId)
  const isEdit = !!empresa
  const e = empresa

  const [nome, setNome] = useState(e?.nome ?? '')
  const [razaoSocial, setRazaoSocial] = useState(e?.razaoSocial ?? '')
  const [cnpj, setCnpj] = useState(e?.cnpj ?? '')
  const [responsaveisIds, setResponsaveisIds] = useState<string[]>(e?.responsaveisIds ?? [])
  const [segmento, setSegmento] = useState<Segmento | ''>(e?.segmento ?? '')
  const [tipoCliente, setTipoCliente] = useState<TipoCliente | ''>(e?.tipoCliente ?? '')
  const [grupoEstrategico, setGrupoEstrategico] = useState<GrupoEstrategico | ''>(e?.grupoEstrategico ?? '')
  const [frequencia, setFrequencia] = useState<Frequencia | ''>(e?.frequencia ?? '')
  const [statusCliente, setStatusCliente] = useState<StatusCliente | ''>(e?.statusCliente ?? '')
  const [porteEmpresa, setPorteEmpresa] = useState<PorteEmpresa | ''>(e?.porteEmpresa ?? '')
  const [site, setSite] = useState(e?.site ?? '')
  const [email, setEmail] = useState(e?.email ?? '')
  const [instagram, setInstagram] = useState(e?.instagram ?? '')
  const [linkedin, setLinkedin] = useState(e?.linkedin ?? '')
  const [endereco, setEndereco] = useState(e?.endereco ?? '')
  const [cidade, setCidade] = useState(e?.cidade ?? '')
  const [uf, setUf] = useState<UF | ''>(e?.uf ?? '')

  const toggleResponsavel = (id: string) => {
    setResponsaveisIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const handleSave = () => {
    if (!nome.trim()) return
    const data = {
      nome: nome.trim(),
      razaoSocial: razaoSocial || undefined,
      cnpj: cnpj || undefined,
      responsaveisIds,
      segmento: (segmento as Segmento) || undefined,
      tipoCliente: (tipoCliente as TipoCliente) || undefined,
      grupoEstrategico: (grupoEstrategico as GrupoEstrategico) || undefined,
      frequencia: (frequencia as Frequencia) || undefined,
      statusCliente: (statusCliente as StatusCliente) || undefined,
      porteEmpresa: (porteEmpresa as PorteEmpresa) || undefined,
      site: site || undefined,
      email: email || undefined,
      instagram: instagram || undefined,
      linkedin: linkedin || undefined,
      endereco: endereco || undefined,
      cidade: cidade || undefined,
      uf: (uf as UF) || undefined,
    }
    if (isEdit && e) {
      updateEmpresa(e.id, data)
      toast.success('Empresa atualizada!')
      onClose()
    } else {
      const nova = addEmpresa(data)
      toast.success(`"${nova.nome}" criada!`)
      if (onCreated) onCreated(nova)
      else onClose()
    }
  }

  const contatosVinculados = isEdit && e
    ? pessoas.filter((p) => (p.empresasIds ?? []).includes(e.id))
    : []

  const orcamentosVinculados = isEdit && e
    ? orcamentos.filter((o) => o.empresaId === e.id)
    : []

  return (
    <ModalShell title={isEdit ? `Editar: ${e?.nome}` : 'Nova Empresa'} onClose={onClose} wide>
      <div className="space-y-3">
        <Section label="Identificação" />
        <Field label="Nome *">
          <input autoFocus className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome fantasia" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Razão Social">
            <input className="input" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} placeholder="Razão Social Ltda." />
          </Field>
          <Field label="CNPJ">
            <input className="input" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" />
          </Field>
        </div>
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

        {/* Vínculos — somente em modo edição */}
        {isEdit && e && (
          <>
            <Section label="Vínculos" />

            <div>
              <p className="text-xs text-slate-400 mb-1.5">Contatos vinculados</p>
              {contatosVinculados.length === 0 ? (
                <p className="text-xs text-slate-600 italic">Nenhum contato vinculado a esta empresa</p>
              ) : (
                <div className="space-y-1">
                  {contatosVinculados.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { onClose(); setPessoaModalEditar(p) }}
                      className="w-full text-left bg-slate-800/50 hover:bg-slate-700/50 rounded-lg px-3 py-2 transition-colors"
                    >
                      <span className="text-sm text-white">{p.nome}</span>
                      {p.cargo && (
                        <span className="text-xs text-slate-500 ml-2">— {CARGO_LABELS[p.cargo]}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1.5">Orçamentos vinculados</p>
              {orcamentosVinculados.length === 0 ? (
                <p className="text-xs text-slate-600 italic">Nenhum orçamento vinculado</p>
              ) : (
                <div className="space-y-1">
                  {orcamentosVinculados.map((orc) => (
                    <button
                      key={orc.id}
                      type="button"
                      onClick={() => { onClose(); setOrcDetalheId(orc.id) }}
                      className="w-full text-left bg-slate-800/50 hover:bg-slate-700/50 rounded-lg px-3 py-2 transition-colors"
                    >
                      <span className="text-xs text-slate-500 font-mono mr-2">{orc.id}</span>
                      <span className="text-sm text-white">{orc.nome}</span>
                      <span className="text-xs text-slate-500 ml-2">— {COLUNA_LABELS[orc.coluna]}</span>
                      {orc.valor != null && (
                        <span className="text-xs text-accent ml-2">— {formatCurrency(orc.valor)}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <Section label="Classificação" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Segmento">
            <select className="input" value={segmento} onChange={(e) => setSegmento(e.target.value as Segmento | '')}>
              <option value="">— Selecionar —</option>
              {(Object.entries(SEGMENTO_LABELS) as [Segmento, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
          <Field label="Tipo de Cliente">
            <select className="input" value={tipoCliente} onChange={(e) => setTipoCliente(e.target.value as TipoCliente | '')}>
              <option value="">— Selecionar —</option>
              {(Object.entries(TIPO_CLIENTE_LABELS) as [TipoCliente, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Grupo Estratégico">
            <select className="input" value={grupoEstrategico} onChange={(e) => setGrupoEstrategico(e.target.value as GrupoEstrategico | '')}>
              <option value="">—</option>
              {(Object.entries(GRUPO_ESTRATEGICO_LABELS) as [GrupoEstrategico, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
          <Field label="Frequência">
            <select className="input" value={frequencia} onChange={(e) => setFrequencia(e.target.value as Frequencia | '')}>
              <option value="">—</option>
              {(Object.entries(FREQUENCIA_LABELS) as [Frequencia, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
          <Field label="Porte">
            <select className="input" value={porteEmpresa} onChange={(e) => setPorteEmpresa(e.target.value as PorteEmpresa | '')}>
              <option value="">—</option>
              {(Object.entries(PORTE_EMPRESA_LABELS) as [PorteEmpresa, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Status">
          <select className="input" value={statusCliente} onChange={(e) => setStatusCliente(e.target.value as StatusCliente | '')}>
            <option value="">— Selecionar —</option>
            {(Object.entries(STATUS_CLIENTE_LABELS) as [StatusCliente, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </Field>

        <Section label="Web" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Site">
            <input className="input" value={site} onChange={(e) => setSite(e.target.value)} placeholder="https://..." />
          </Field>
          <Field label="E-mail">
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@empresa.com" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Instagram">
            <input className="input" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@empresa" />
          </Field>
          <Field label="LinkedIn">
            <input className="input" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/company/..." />
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

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="btn-ghost">Cancelar</button>
          <button onClick={handleSave} disabled={!nome.trim()} className="btn-primary">
            {isEdit ? 'Salvar Alterações' : 'Criar Empresa'}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
