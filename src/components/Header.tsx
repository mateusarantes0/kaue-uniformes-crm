import { useStore } from '../store/useStore'

export function Header() {
  const setModalCriar = useStore((s) => s.setModalCriar)

  return (
    <header className="bg-[#0a1628] border-b border-slate-700/60 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-lg">
      <div className="flex items-center gap-3">
        <img
          src="/logo.png"
          alt="Kaue Uniformes"
          className="h-10 w-auto object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <span className="text-slate-400 text-xs border-l border-slate-600 pl-3 hidden sm:block">
          CRM Interno
        </span>
      </div>
      <button
        onClick={() => setModalCriar(true)}
        className="bg-accent hover:bg-accent-light text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
      >
        <span className="text-base leading-none">+</span>
        Novo Cliente
      </button>
    </header>
  )
}
