import { create } from 'zustand';
import supabase from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getCurrentSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,

  signUp: async (email, password, name, phone) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            name: name,
            phone: phone,
          },
          isAuthenticated: true,
          loading: false,
        });
      }
    } catch (err: any) {
      set({ error: err.message || 'خطأ في التسجيل', loading: false });
      throw err;
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            name: profile?.name || '',
            phone: profile?.phone || '',
          },
          isAuthenticated: true,
          loading: false,
        });
      }
    } catch (err: any) {
      set({ error: err.message || 'خطأ في تسجيل الدخول', loading: false });
      throw err;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'خطأ في تسجيل الخروج', loading: false });
      throw err;
    }
  },

  getCurrentSession: async () => {
    set({ loading: true });
    try {
      const { data } = await supabase.auth.getSession();
      
      if (data.session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        set({
          user: {
            id: data.session.user.id,
            email: data.session.user.email || '',
            name: profile?.name || '',
            phone: profile?.phone || '',
          },
          isAuthenticated: true,
          loading: false,
        });
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
