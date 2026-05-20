import { create } from 'zustand'
import { AuthState, User } from '@/types'

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setAdmin: (isAdmin: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isAdmin: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setAdmin: (isAdmin) => set({ isAdmin }),

  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      error: null,
    }),
}))
