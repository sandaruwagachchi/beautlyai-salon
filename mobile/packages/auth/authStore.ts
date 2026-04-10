import { create } from 'zustand';

export type UserRole = 'CUSTOMER' | 'STAFF' | 'OWNER' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
  clearAuth: () => set({ token: null, user: null, isAuthenticated: false }),
}));
