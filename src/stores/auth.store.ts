import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/auth.types';

interface AuthState {
  accessToken:  string | null;
  refreshToken: string | null;
  user:         User | null;
  isAuthenticated: boolean;

  setAuth:   (tokens: { accessToken: string; refreshToken: string }, user: User) => void;
  setUser:   (user: User) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  getRole: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken:     null,
      refreshToken:    null,
      user:            null,
      isAuthenticated: false,

      setAuth: (tokens, user) => set({
        accessToken:     tokens.accessToken,
        refreshToken:    tokens.refreshToken,
        user,
        isAuthenticated: true,
      }),

      setUser: (user) => set({ user }),

      setAccessToken: (token) => set({ accessToken: token }),

  clearAuth: () => set({
    accessToken:     null,
    refreshToken:    null,
    user:            null,
    isAuthenticated: false,
  }),

  isAdmin: () => {
    const user = get().user;
    return user?.role.name === 'ADMIN';
  },

  getRole: () => {
    return get().user?.role.name ?? null;
  },

      hasPermission: (permission) => {
        const user = get().user;
        if (!user) return false;
        return user.permissions?.includes(permission) ?? false;
      },
    }),
    {
      name:    'ledgerlens-auth',
      partialize: (state) => ({
        accessToken:     state.accessToken,
        refreshToken:    state.refreshToken,
        user:            state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
