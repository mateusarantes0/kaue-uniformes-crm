import { toast } from 'react-hot-toast'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../store/useAuthStore'

export function Header() {
  const setModalCriar = useStore((s) => s.setModalCriar)
  const user   = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    toast('Até logo!')
  }

  return (
    <header className="bg-[#0a1628] border-b border-slate-700/60 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-lg">
      <div className="flex items-center gap-3">
        <img
          src="/logo.png"
          alt="Kaue Uniformes"
          className="h-10 w-auto object-contain"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
        <span className="text-slate-400 text-xs border-l border-slate-600 pl-3 hidden sm:block">
          CRM Interno
        </span>
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <>
            <span className="text-slate-300 text-sm hidden sm:block">{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors"
            >
              Sair
            </button>
          </>
        )}
        <button
          onClick={() => setModalCriar(true)}
          className="bg-accent hover:bg-accent-light text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <span className="text-base leading-none">+</span>
          Novo Cliente
        </button>
      </div>
    </header>
  )
}
