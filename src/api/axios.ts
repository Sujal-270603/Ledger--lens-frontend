import axios, { type AxiosError } from 'axios';
import { config as appConfig } from '@/lib/config';

const BASE_URL = appConfig.apiBaseUrl;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ── Request interceptor: attach access token ──────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Import dynamically to avoid circular deps
    const stored = localStorage.getItem('ledgerlens-auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      const token  = parsed?.state?.accessToken;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: auto token refresh on 401 ──────────────────────
let isRefreshing     = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject:  (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  refreshQueue.forEach(p => error ? p.reject(error) : p.resolve(token!));
  refreshQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !original?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then(token => {
          if (original) original.headers!.Authorization = `Bearer ${token}`;
          return api(original!);
        });
      }

      original!._retry = true;
      isRefreshing     = true;

      try {
        const stored = localStorage.getItem('ledgerlens-auth');
        const parsed = stored ? JSON.parse(stored) : null;
        const refreshToken = parsed?.state?.refreshToken;

        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Update store
        const { useAuthStore } = await import('@/stores/auth.store');
        useAuthStore.getState().setAccessToken(accessToken);

        // Update localStorage directly for next request
        const updated = JSON.parse(localStorage.getItem('ledgerlens-auth')!);
        updated.state.accessToken  = accessToken;
        updated.state.refreshToken = newRefreshToken;
        localStorage.setItem('ledgerlens-auth', JSON.stringify(updated));

        processQueue(null, accessToken);
        if (original) original.headers!.Authorization = `Bearer ${accessToken}`;
        return api(original!);
      } catch (refreshError) {
        processQueue(refreshError, null);
        const { useAuthStore } = await import('@/stores/auth.store');
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
