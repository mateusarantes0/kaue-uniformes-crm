import { Empresa } from '../../types'
import { usePessoaStore } from '../../store/usePessoaStore'
import { useOrcamentoStore } from '../../store/useOrcamentoStore'
import { ContatoVinculadoCard } from './ContatoVinculadoCard'
import { OrcamentoVinculadoCard } from './OrcamentoVinculadoCard'

interface Props {
  empresa: Empresa
  onClose: () => void
}

export function VinculosSection({ empresa, onClose }: Props) {
  const pessoas = usePessoaStore((s) => s.pessoas)
  const setPessoaModalEditar = usePessoaStore((s) => s.setModalEditar)
  const orcamentos = useOrcamentoStore((s) => s.orcamentos)
  const setOrcDetalheId = useOrcamentoStore((s) => s.setModalDetalheId)

  const contatos = pessoas.filter((p) => (p.empresasIds ?? []).includes(empresa.id))
  const orcs = orcamentos.filter((o) => o.empresaId === empresa.id)

  if (contatos.length === 0 && orcs.length === 0) {
    return (
      <p className="text-xs text-slate-600 italic py-1">
        Nenhum vínculo encontrado para esta empresa.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-xs text-slate-400 font-medium mb-2">
          Contatos
          <span className="ml-1.5 text-slate-600">({contatos.length})</span>
        </p>
        {contatos.length === 0 ? (
          <p className="text-xs text-slate-600 italic">Nenhum contato vinculado</p>
        ) : (
          <div className="space-y-1.5">
            {contatos.map((p) => (
              <ContatoVinculadoCard
                key={p.id}
                pessoa={p}
                onClick={() => { onClose(); setPessoaModalEditar(p) }}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs text-slate-400 font-medium mb-2">
          Orçamentos
          <span className="ml-1.5 text-slate-600">({orcs.length})</span>
        </p>
        {orcs.length === 0 ? (
          <p className="text-xs text-slate-600 italic">Nenhum orçamento vinculado</p>
        ) : (
          <div className="space-y-1.5">
            {orcs.map((orc) => (
              <OrcamentoVinculadoCard
                key={orc.id}
                orcamento={orc}
                onClick={() => { onClose(); setOrcDetalheId(orc.id) }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
