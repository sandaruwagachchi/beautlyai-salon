import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
  type AxiosInstance,
} from 'axios';
import * as SecureStore from 'expo-secure-store';
import { navigateToAuth } from './navigationRef';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const client: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 20000,
});

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await SecureStore.getItemAsync('jwt_token');

  if (token) {
    const headers =
      config.headers instanceof AxiosHeaders
        ? config.headers
        : new AxiosHeaders(config.headers as Record<string, string>);

    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('jwt_token');
      await SecureStore.deleteItemAsync('user_role');
      navigateToAuth();
    }

    return Promise.reject(error);
  }
);

export default client;
