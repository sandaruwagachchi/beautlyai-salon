import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'jwt_token';
const ROLE_KEY = 'user_role';
const USERNAME_KEY = 'username';

type SessionRole = 'CUSTOMER' | 'STAFF' | 'OWNER' | 'ADMIN';

interface AuthSession {
  token: string;
  role: SessionRole;
  username: string;
}

const isWeb = Platform.OS === 'web';

const webStorage = {
  getItem(key: string): string | null {
    try {
      return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Ignore storage failures on web private mode / blocked storage.
    }
  },
  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Ignore storage failures on web private mode / blocked storage.
    }
  },
};

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      return webStorage.getItem(key);
    }

    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      webStorage.setItem(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      webStorage.removeItem(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  },
};

export const tokenService = {
  async readToken(): Promise<string | null> {
    return storage.getItem(TOKEN_KEY);
  },

  async readRole(): Promise<string | null> {
    return storage.getItem(ROLE_KEY);
  },

  async writeToken(token: string): Promise<void> {
    await storage.setItem(TOKEN_KEY, token);
  },

  async writeRole(role: string): Promise<void> {
    await storage.setItem(ROLE_KEY, role);
  },

  async writeUsername(username: string): Promise<void> {
    await storage.setItem(USERNAME_KEY, username);
  },

  async readUsername(): Promise<string | null> {
    return storage.getItem(USERNAME_KEY);
  },

  async writeSession(session: AuthSession): Promise<void> {
    await Promise.all([
      storage.setItem(TOKEN_KEY, session.token),
      storage.setItem(ROLE_KEY, session.role),
      storage.setItem(USERNAME_KEY, session.username),
    ]);
  },

  async readSession(): Promise<AuthSession | null> {
    const [token, role, username] = await Promise.all([
      storage.getItem(TOKEN_KEY),
      storage.getItem(ROLE_KEY),
      storage.getItem(USERNAME_KEY),
    ]);

    if (!token || !role || !username) {
      return null;
    }

    return {
      token,
      role: role as SessionRole,
      username,
    };
  },

  async clear(): Promise<void> {
    await Promise.all([
      storage.removeItem(TOKEN_KEY),
      storage.removeItem(ROLE_KEY),
      storage.removeItem(USERNAME_KEY),
      storage.removeItem('auth-storage'),
    ]);
  },
};
