import { create } from 'zustand';

export type UserRole = 'CUSTOMER' | 'STAFF' | 'OWNER' | 'ADMIN';

export interface AuthUser {
  id?: string;
  email?: string;
  fullName?: string;
  username: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  setBootstrapping: (value: boolean) => void;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isBootstrapping: true,
  isAuthenticated: false,
  setBootstrapping: (value) => set({ isBootstrapping: value }),
  setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
  clearAuth: () => set({ token: null, user: null, isAuthenticated: false }),
}));
