import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
  type AxiosInstance,
} from 'axios';
import { navigateToAuth } from './navigationRef';
import { tokenService } from '@beautlyai/auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const client: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 20000,
});

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await tokenService.readToken();

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
      await tokenService.clear();
      navigateToAuth();
    }

    return Promise.reject(error);
  }
);

export default client;
