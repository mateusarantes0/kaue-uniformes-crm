import { useEmpresaStore } from '../../store/useEmpresaStore'

interface Props {
  empresaId: string
  onOpenEmpresa: (empresaId: string) => void
}

export function EmpresaChip({ empresaId, onOpenEmpresa }: Props) {
  const empresa = useEmpresaStore((s) => s.empresas.find((e) => e.id === empresaId))
  if (!empresa) return null

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onOpenEmpresa(empresaId)
      }}
      className="inline-flex items-center px-2 py-0.5 text-[12px] font-medium
                 rounded-md max-w-[200px] truncate
                 bg-[rgba(249,115,22,0.08)] hover:bg-[rgba(249,115,22,0.15)]
                 text-[#fdba74] border border-[rgba(249,115,22,0.25)]
                 transition-colors duration-[120ms]"
    >
      {empresa.nome}
    </button>
  )
}
