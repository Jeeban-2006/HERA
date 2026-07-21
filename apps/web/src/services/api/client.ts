import axios, { AxiosInstance, AxiosError } from 'axios';
import { useAuthStore } from '@/state/auth.store';
import { useUIStore } from '@/state/ui.store';
import { API_BASE_URL } from '@/lib/constants';

let apiClient: AxiosInstance | null = null;

function getAuthToken(): string | null {
  const { token } = useAuthStore.getState();
  return token;
}

function logout() {
  const { logout: authLogout } = useAuthStore.getState();
  authLogout();
}

export function createAPIClient(): AxiosInstance {
  if (apiClient) {
    return apiClient;
  }

  apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor: attach JWT token
  apiClient.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor: handle 401 and refresh token
  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const { addToast } = useUIStore.getState();

      if (error.response?.status === 401) {
        logout();
        addToast('Session expired. Please log in again.', 'warning');
        window.location.href = '/login';
      } else if (error.response?.status === 500) {
        addToast('Server error. Please try again later.', 'error');
      } else if (error.message === 'Network Error') {
        addToast('Network error. Check your connection.', 'error');
      }

      return Promise.reject(error);
    }
  );

  return apiClient;
}
