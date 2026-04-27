import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  role: 'admin' | 'employee'
}

interface UserCredential {
  id: string
  name: string
  username: string
  password: string
  role: 'admin' | 'employee'
}

interface AuthStore {
  user: User | null
  users: UserCredential[]
  login: (username: string, password: string) => boolean
  logout: () => void
  changePassword: (userId: string, currentPassword: string, newPassword: string) => boolean
}

const INITIAL_USERS: UserCredential[] = [
  { id: 'admin', name: 'Admin', username: 'admin', password: 'admin123', role: 'admin'    },
  { id: 'noemi', name: 'Noemi', username: 'noemi', password: 'noemi123', role: 'employee' },
  { id: 'dione', name: 'Dione', username: 'dione', password: 'dione123', role: 'employee' },
]

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      users: INITIAL_USERS,

      login: (username, password) => {
        const cred = get().users.find((u) => u.username === username)
        if (!cred || cred.password !== password) return false
        set({ user: { id: cred.id, name: cred.name, role: cred.role } })
        return true
      },

      logout: () => set({ user: null }),

      changePassword: (userId, currentPassword, newPassword) => {
        const cred = get().users.find((u) => u.id === userId)
        if (!cred || cred.password !== currentPassword) return false
        set({
          users: get().users.map((u) =>
            u.id === userId ? { ...u, password: newPassword } : u
          ),
        })
        return true
      },
    }),
    { name: 'kaue-crm-auth' }
  )
)
