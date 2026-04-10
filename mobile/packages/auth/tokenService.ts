import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'jwt_token';
const ROLE_KEY = 'user_role';

export const tokenService = {
  async readToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async readRole(): Promise<string | null> {
    return SecureStore.getItemAsync(ROLE_KEY);
  },

  async writeToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async writeRole(role: string): Promise<void> {
    await SecureStore.setItemAsync(ROLE_KEY, role);
  },

  async clear(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(ROLE_KEY),
      SecureStore.deleteItemAsync('auth-storage'),
    ]);
  },
};
