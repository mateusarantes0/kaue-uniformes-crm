import { Toaster } from 'react-hot-toast'
import { useStore } from './store/useStore'
import { useAuthStore } from './store/useAuthStore'
import { Header } from './components/Header'
import { Dashboard } from './components/Dashboard'
import { AdminDashboard } from './components/AdminDashboard'
import { Board } from './components/Board'
import { Footer } from './components/Footer'
import { LoginPage } from './components/LoginPage'
import { CreateModal } from './components/modals/CreateModal'
import { EditModal } from './components/modals/EditModal'
import { ObjecaoModal } from './components/modals/LossModal'

export default function App() {
  const modalCriar  = useStore((s) => s.modalCriar)
  const modalEditar = useStore((s) => s.modalEditar)
  const pendingMove = useStore((s) => s.pendingMove)
  const user        = useAuthStore((s) => s.user)

  if (!user) {
    return (
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1E293B', color: '#fff', border: '1px solid #334155' },
          }}
        />
        <LoginPage />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1E293B', color: '#fff', border: '1px solid #334155' },
        }}
      />

      <Header />

      {user.role === 'admin' && <AdminDashboard />}

      <Dashboard />

      <main className="flex-1 overflow-hidden">
        <Board />
      </main>

      <Footer />

      {modalCriar  && <CreateModal />}
      {modalEditar && <EditModal orcamento={modalEditar} />}
      {pendingMove && <ObjecaoModal />}
    </div>
  )
}
