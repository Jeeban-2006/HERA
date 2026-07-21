import axios from "axios";
import { useAuthStore } from "@/state/auth.store";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});


// Request interceptor — attach access token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 with refresh-once retry
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          { refresh_token: refreshToken }
        );
        useAuthStore.getState().setAuth(
          data.access_token,
          refreshToken, // gateway doesn't rotate refresh tokens yet based on schemas, but we could update if it did
          useAuthStore.getState().user!
        );
        if (original.headers) {
          original.headers.Authorization = `Bearer ${data.access_token}`;
        }
        return apiClient(original);
      } catch (err) {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
