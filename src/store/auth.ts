import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthUser, UserRole } from '@/types'

interface AuthStoreState {
  user: AuthUser | null
  login: (username: string, password: string) => boolean
  logout: () => void
  isAuthenticated: () => boolean
  hasRole: (role: UserRole | UserRole[]) => boolean
}

const mockUsers: AuthUser[] = [
  {
    id: 'admin_001',
    username: 'admin',
    role: 'admin',
    name: '系统管理员',
  },
  {
    id: 'reception_001',
    username: 'reception',
    role: 'reception',
    name: '前台小王',
  },
  {
    id: 'tech_001',
    username: 'tech1',
    role: 'technician',
    name: '李师傅',
    technicianId: 't1',
  },
  {
    id: 'tech_002',
    username: 'tech2',
    role: 'technician',
    name: '王师傅',
    technicianId: 't2',
  },
  {
    id: 'tech_003',
    username: 'tech3',
    role: 'technician',
    name: '张师傅',
    technicianId: 't3',
  },
  {
    id: 'tech_004',
    username: 'tech4',
    role: 'technician',
    name: '陈师傅',
    technicianId: 't4',
  },
  {
    id: 'tech_005',
    username: 'tech5',
    role: 'technician',
    name: '赵师傅',
    technicianId: 't5',
  },
]

const passwordMap: Record<string, string> = {
  admin: '123456',
  reception: '123456',
  tech1: '123456',
  tech2: '123456',
  tech3: '123456',
  tech4: '123456',
  tech5: '123456',
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      user: null,

      login: (username: string, password: string) => {
        const user = mockUsers.find((u) => u.username === username)
        if (user && passwordMap[username] === password) {
          set({ user })
          return true
        }
        return false
      },

      logout: () => {
        set({ user: null })
      },

      isAuthenticated: () => {
        return get().user !== null
      },

      hasRole: (role: UserRole | UserRole[]) => {
        const user = get().user
        if (!user) return false
        if (Array.isArray(role)) {
          return role.includes(user.role)
        }
        return user.role === role
      },
    }),
    {
      name: 'foot-spa-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

window.addEventListener('storage', (event) => {
  if (event.key === 'foot-spa-auth' && event.newValue === null) {
    useAuthStore.setState({ user: null })
  }
})
