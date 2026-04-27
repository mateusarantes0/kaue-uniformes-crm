import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  role: 'admin' | 'employee'
}

interface AuthStore {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
}

const USERS: Record<string, { password: string; user: User }> = {
  admin: { password: 'admin123', user: { id: 'admin', name: 'Admin',  role: 'admin'    } },
  noemi: { password: 'noemi123', user: { id: 'noemi', name: 'Noemi',  role: 'employee' } },
  dione: { password: 'dione123', user: { id: 'dione', name: 'Dione',  role: 'employee' } },
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      login: (username, password) => {
        const entry = USERS[username]
        if (!entry || entry.password !== password) return false
        set({ user: entry.user })
        return true
      },
      logout: () => set({ user: null }),
    }),
    { name: 'kaue-crm-auth' }
  )
)
