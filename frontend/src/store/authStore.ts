import { create } from 'zustand';
import type { User } from '../types/auth'; // <--- 'import type' ulit

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialLoading: boolean;
  setAuth: (user: User) => void;
  setInitialLoading: (status: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialLoading: true,
  setAuth: (user) => set({ 
    user, 
    isAuthenticated: true, 
    isInitialLoading: false 
  }),
  setInitialLoading: (status) => set({ 
    isInitialLoading: status 
  }),
  logout: () => set({ 
    user: null, 
    isAuthenticated: false, 
    isInitialLoading: false 
  }),
}));