export type AuthRole = 'CUSTOMER' | 'STAFF' | 'OWNER' | 'ADMIN';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: AuthRole;
}
