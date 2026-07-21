import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  dob?: string;
  avatarUrl?: string;
  cycleStartDate?: string;
  healthGoals?: string[];
  emergencyContacts?: Array<{ name: string; phone: string; email: string }>;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  hasHydrated: boolean;
  setAuth: (access: string, refresh: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setHasHydrated: (v: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      hasHydrated: false,
      setAuth: (access, refresh, user) => set({ accessToken: access, refreshToken: refresh, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
      updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
    }),
    {
      name: 'hera-auth',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
