import client from './client';
import { authEndpoints } from './endpoints/auth';
import type { AuthResponse, LoginRequest, RegisterRequest } from './types/auth';

export const authApi = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const response = await client.post<AuthResponse>(authEndpoints.login, payload);
    return response.data;
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const response = await client.post<AuthResponse>(authEndpoints.register, payload);
    return response.data;
  },
};
