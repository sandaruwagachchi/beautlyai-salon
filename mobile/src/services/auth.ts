/**
 * Authentication Service
 * Handles login, logout, and token management
 */

import * as SecureStore from 'expo-secure-store';
import apiClient from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: 'CUSTOMER' | 'STAFF' | 'OWNER' | 'ADMIN';
  };
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      await SecureStore.setItemAsync('jwt_token', response.token);
      await SecureStore.setItemAsync('user_role', response.user.role);
      return response;
    } catch (error) {
      throw new Error('Login failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      await SecureStore.deleteItemAsync('jwt_token');
      await SecureStore.deleteItemAsync('user_role');
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const response = await apiClient.post<{ token: string }>('/auth/refresh', {});
      await SecureStore.setItemAsync('jwt_token', response.token);
      return response.token;
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }

  async getStoredToken(): Promise<string | null> {
    return SecureStore.getItemAsync('jwt_token');
  }

  async getStoredRole(): Promise<string | null> {
    return SecureStore.getItemAsync('user_role');
  }
}

export default new AuthService();

