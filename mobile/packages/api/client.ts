import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
  type AxiosInstance,
} from 'axios';
import { Platform } from 'react-native';
import { navigateToAuth } from './navigationRef';
import { tokenService } from '@beautlyai/auth';

const PRIMARY_API_URL = process.env.EXPO_PUBLIC_API_URL?.trim();
const ANDROID_EMULATOR_API_URL = process.env.EXPO_PUBLIC_API_URL_ANDROID?.trim() ?? 'http://10.0.2.2:8080/api/v1';
const LOCALHOST_API_URL = process.env.EXPO_PUBLIC_API_URL_LOCALHOST?.trim() ?? 'http://localhost:8080/api/v1';

const getApiBaseUrlCandidates = (): string[] => {
  const candidates = [PRIMARY_API_URL];

  if (Platform.OS === 'android') {
    candidates.push(ANDROID_EMULATOR_API_URL, LOCALHOST_API_URL);
  } else if (Platform.OS === 'web') {
    candidates.push(LOCALHOST_API_URL);
  } else {
    candidates.push(LOCALHOST_API_URL, ANDROID_EMULATOR_API_URL);
  }

  return candidates.filter((value, index, list): value is string => Boolean(value) && list.indexOf(value) === index);
};

const client: AxiosInstance = axios.create({
  baseURL: PRIMARY_API_URL,
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
      return Promise.reject(error);
    }

    const originalConfig = error.config as (InternalAxiosRequestConfig & {
      _apiBaseUrlRetryIndex?: number;
    }) | undefined;

    if (!error.response && originalConfig) {
      const candidates = getApiBaseUrlCandidates();
      const currentBaseUrl = originalConfig.baseURL?.trim() ?? PRIMARY_API_URL ?? '';
      const currentIndex = Math.max(candidates.indexOf(currentBaseUrl), originalConfig._apiBaseUrlRetryIndex ?? -1);
      const nextIndex = currentIndex + 1;

      if (nextIndex < candidates.length) {
        originalConfig.baseURL = candidates[nextIndex];
        originalConfig._apiBaseUrlRetryIndex = nextIndex;
        return client.request(originalConfig);
      }
    }

    return Promise.reject(error);
  }
);

export default client;
