import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useOrcamentoStore } from '../store/useOrcamentoStore'
import { usePessoaStore } from '../store/usePessoaStore'
import { useEmpresaStore } from '../store/useEmpresaStore'
import { useNavStore } from '../store/useNavStore'
import { useAuthStore } from '../store/useAuthStore'
import { ChangePasswordModal } from './ChangePasswordModal'
import { EntityType } from '../types'

const TABS: { id: EntityType; label: string; emoji: string }[] = [
  { id: 'orcamento', label: 'Orçamentos', emoji: '📋' },
  { id: 'pessoa',    label: 'Pessoas',    emoji: '👤' },
  { id: 'empresa',   label: 'Empresas',   emoji: '🏢' },
]

export function Header() {
  const entity = useNavStore((s) => s.entity)
  const setEntity = useNavStore((s) => s.setEntity)

  const setModalCriarOrc = useOrcamentoStore((s) => s.setModalCriar)
  const setModalCriarPes = usePessoaStore((s) => s.setModalCriar)
  const setModalCriarEmp = useEmpresaStore((s) => s.setModalCriar)

  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const [changePwOpen, setChangePwOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast('Até logo!')
  }

  const handleNovo = () => {
    if (entity === 'orcamento') setModalCriarOrc(true)
    else if (entity === 'pessoa') setModalCriarPes(true)
    else setModalCriarEmp(true)
  }

  const NOVO_LABEL: Record<EntityType, string> = {
    orcamento: 'Novo Orçamento',
    pessoa:    'Nova Pessoa',
    empresa:   'Nova Empresa',
  }

  return (
    <>
      <header className="bg-[#0a1628] border-b border-slate-700/60 sticky top-0 z-40 shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Logo */}
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

          {/* Tabs */}
          <div className="flex items-center gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setEntity(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  entity === tab.id
                    ? 'text-accent bg-amber-900/20 border border-amber-800/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
                }`}
              >
                <span className="text-base leading-none">{tab.emoji}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                <span className="text-slate-300 text-sm hidden sm:block">{user.name}</span>
                <button
                  onClick={() => setChangePwOpen(true)}
                  title="Alterar senha"
                  className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-700/50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </button>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors"
                >
                  Sair
                </button>
              </>
            )}
            <button
              onClick={handleNovo}
              className="bg-accent hover:bg-accent-light text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <span className="text-base leading-none">+</span>
              <span className="hidden sm:inline">{NOVO_LABEL[entity]}</span>
              <span className="sm:hidden">Novo</span>
            </button>
          </div>
        </div>
      </header>

      {changePwOpen && <ChangePasswordModal onClose={() => setChangePwOpen(false)} />}
    </>
  )
}
