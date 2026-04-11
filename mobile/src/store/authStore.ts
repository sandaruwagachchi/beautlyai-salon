/**
 * Auth Store
 * Global authentication state management using Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'STAFF' | 'OWNER' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
  setIsLoading: (loading: boolean) => void;
}

const secureStorage = {
  getItem: async (name: string) => {
    try {
      const value = await SecureStore.getItemAsync(name);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Secure store get error:', error);
      return null;
    }
  },
  setItem: async (name: string, value: any) => {
    try {
      await SecureStore.setItemAsync(name, JSON.stringify(value));
    } catch (error) {
      console.error('Secure store set error:', error);
    }
  },
  removeItem: async (name: string) => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.error('Secure store remove error:', error);
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => set({ token }),
      clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);

