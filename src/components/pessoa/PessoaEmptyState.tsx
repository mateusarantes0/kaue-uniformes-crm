import { usePessoaStore } from '../../store/usePessoaStore'

export function PessoaEmptyState() {
  const setModalCriar = usePessoaStore((s) => s.setModalCriar)

  return (
    <div className="flex flex-col items-center text-center py-20 px-5">
      <div
        className="w-16 h-16 mb-4 rounded-2xl flex items-center justify-center
                   bg-[rgba(148,163,184,0.08)] border border-slate-700 text-slate-500"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" strokeWidth={1.5} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <h4 className="text-[16px] font-semibold text-white">Nenhuma pessoa cadastrada</h4>
      <p className="mt-1 text-[13px] text-slate-400 max-w-[320px]">
        Cadastre leads, clientes e fornecedores para vincular aos orçamentos.
      </p>
      <button
        onClick={() => setModalCriar(true)}
        className="btn-primary mt-5 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
        </svg>
        Cadastrar primeira pessoa
      </button>
    </div>
  )
}
