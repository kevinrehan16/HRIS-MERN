import { create } from 'zustand';
import type { User } from '../types/auth'; // <--- 'import type' ulit
import { AuthService } from '../services/auth.service'

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
  
  // Sa loob ng useAuthStore
  logout: async () => {
    try {
      // 1. Tawagin ang backend (optional, but good for clearing cookie)
      await AuthService.logout(); 
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      // 2. LINISIN LANG ANG STATE. 
      // Huwag mag-window.location.href dito para hindi mag-loop!
      set({ user: null, isAuthenticated: false, isInitialLoading: false });
    }
  }
}));