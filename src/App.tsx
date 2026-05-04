import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/useAuthStore'
import { useNavStore } from './store/useNavStore'
import { useOrcamentoStore } from './store/useOrcamentoStore'
import { usePessoaStore } from './store/usePessoaStore'
import { useEmpresaStore } from './store/useEmpresaStore'
import { Header } from './components/Header'
import { Dashboard } from './components/Dashboard'
import { AdminDashboard } from './components/AdminDashboard'
import { Board } from './components/Board'
import { PessoaList } from './components/PessoaList'
import { EmpresaList } from './components/EmpresaList'
import { Footer } from './components/Footer'
import { LoginPage } from './components/LoginPage'
import { OrcamentoModal } from './components/modals/OrcamentoModal'
import { OrcamentoDetalhe } from './components/modals/OrcamentoDetalhe'
import { ObjecaoModal } from './components/modals/LossModal'
import { PessoaModal } from './components/modals/PessoaModal'
import { EmpresaModal } from './components/modals/EmpresaModal'

const toastStyle = { background: '#1E293B', color: '#fff', border: '1px solid #334155' }

export default function App() {
  const user = useAuthStore((s) => s.user)
  const entity = useNavStore((s) => s.entity)

  // Read modal state to conditionally mount
  const orcModalCriar  = useOrcamentoStore((s) => s.modalCriar)
  const orcModalEditar = useOrcamentoStore((s) => s.modalEditar)
  const orcDetalheId   = useOrcamentoStore((s) => s.modalDetalheId)
  const pendingMove    = useOrcamentoStore((s) => s.pendingMove)

  const pesModalCriar  = usePessoaStore((s) => s.modalCriar)
  const pesModalEditar = usePessoaStore((s) => s.modalEditar)
  const setPesModalCriar  = usePessoaStore((s) => s.setModalCriar)
  const setPesModalEditar = usePessoaStore((s) => s.setModalEditar)

  const empModalCriar  = useEmpresaStore((s) => s.modalCriar)
  const empModalEditar = useEmpresaStore((s) => s.modalEditar)
  const setEmpModalCriar  = useEmpresaStore((s) => s.setModalCriar)
  const setEmpModalEditar = useEmpresaStore((s) => s.setModalEditar)

  if (!user) {
    return (
      <>
        <Toaster position="top-right" toastOptions={{ style: toastStyle }} />
        <LoginPage />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Toaster position="top-right" toastOptions={{ style: toastStyle }} />

      <Header />

      {entity === 'orcamento' && (
        <>
          {user.role === 'admin' && <AdminDashboard />}
          <Dashboard />
          <main className="flex-1 overflow-hidden">
            <Board />
          </main>
        </>
      )}

      {entity === 'pessoa' && (
        <main className="flex-1 overflow-auto">
          <PessoaList />
        </main>
      )}

      {entity === 'empresa' && (
        <main className="flex-1 overflow-auto">
          <EmpresaList />
        </main>
      )}

      <Footer />

      {/* Orçamento modals — no props, read state from store internally */}
      {(orcModalCriar || orcModalEditar) && <OrcamentoModal />}
      {orcDetalheId && <OrcamentoDetalhe />}
      {pendingMove && <ObjecaoModal />}

      {/* Pessoa modals */}
      {pesModalCriar && (
        <PessoaModal onClose={() => setPesModalCriar(false)} />
      )}
      {pesModalEditar && (
        <PessoaModal pessoa={pesModalEditar} onClose={() => setPesModalEditar(null)} />
      )}

      {/* Empresa modals */}
      {empModalCriar && (
        <EmpresaModal onClose={() => setEmpModalCriar(false)} />
      )}
      {empModalEditar && (
        <EmpresaModal empresa={empModalEditar} onClose={() => setEmpModalEditar(null)} />
      )}
    </div>
  )
}
