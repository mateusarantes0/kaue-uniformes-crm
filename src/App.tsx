import { Toaster } from 'react-hot-toast'
import { useStore } from './store/useStore'
import { Header } from './components/Header'
import { Dashboard } from './components/Dashboard'
import { Board } from './components/Board'
import { Footer } from './components/Footer'
import { CreateModal } from './components/modals/CreateModal'
import { EditModal } from './components/modals/EditModal'
import { ObjecaoModal } from './components/modals/LossModal'

export default function App() {
  const modalCriar  = useStore((s) => s.modalCriar)
  const modalEditar = useStore((s) => s.modalEditar)
  const pendingMove = useStore((s) => s.pendingMove)

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1E293B', color: '#fff', border: '1px solid #334155' },
        }}
      />

      <Header />
      <Dashboard />

      <main className="flex-1 overflow-hidden">
        <Board />
      </main>

      <Footer />

      {modalCriar  && <CreateModal />}
      {modalEditar && <EditModal cliente={modalEditar} />}
      {pendingMove && <ObjecaoModal />}
    </div>
  )
}
