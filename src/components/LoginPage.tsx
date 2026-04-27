import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../store/useAuthStore'

export function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const ok = login(username.trim(), password)
    if (!ok) toast.error('Usuário ou senha inválidos')
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="flex justify-center mb-8">
          <img
            src="/logo.png"
            alt="Kaue Uniformes"
            className="h-16 w-auto object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>
        <h1 className="text-center text-white text-xl font-bold mb-1">CRM Interno</h1>
        <p className="text-center text-slate-400 text-sm mb-6">Faça login para continuar</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Usuário</label>
            <input
              className="input"
              type="text"
              placeholder="usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Senha</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn-primary w-full mt-2">
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
