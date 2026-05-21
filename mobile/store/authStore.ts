import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: any
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

interface AuthStore extends AuthState {
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  getCurrentSession: () => Promise<void>
  setError: (error: string | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  signUp: async (email: string, password: string, fullName: string, phone: string) => {
    set({ isLoading: true, error: null })
    try {
      // 1. إنشاء حساب في Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw new Error(authError.message)

      // 2. إضافة بيانات المستخدم في جدول users
      if (authData.user) {
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          phone,
        })

        if (profileError) throw new Error(profileError.message)
      }

      set({ isAuthenticated: true, user: authData.user })
    } catch (err: any) {
      set({ error: err.message })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw new Error(error.message)

      // جلب بيانات المستخدم الإضافية
      if (data.user) {
        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        set({
          isAuthenticated: true,
          user: { ...data.user, profile: profileData },
        })
      }
    } catch (err: any) {
      set({ error: err.message })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw new Error(error.message)
      set({ isAuthenticated: false, user: null })
    } catch (err: any) {
      set({ error: err.message })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  getCurrentSession: async () => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw new Error(error.message)

      if (data.session?.user) {
        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.session.user.id)
          .single()

        set({
          isAuthenticated: true,
          user: { ...data.session.user, profile: profileData },
        })
      } else {
        set({ isAuthenticated: false, user: null })
      }
    } catch (err: any) {
      set({ error: err.message })
    } finally {
      set({ isLoading: false })
    }
  },

  setError: (error: string | null) => set({ error }),
}))
