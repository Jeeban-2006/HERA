import apiClient from "./client";
import { User } from "@/state/auth.store";

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export const authApi = {
  register: async (data: any) => {
    const res = await apiClient.post<TokenResponse>("/auth/register", data);
    return res.data;
  },
  login: async (data: any) => {
    const res = await apiClient.post<TokenResponse>("/auth/login", data);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get<User>("/users/me");
    return res.data;
  },
  getHealthProfile: async () => {
    const res = await apiClient.get<any>("/users/me/health-profile");
    return res.data;
  },
  updateProfile: async (data: Partial<User> & { cycle_length?: number, last_period_date?: string }) => {
    const res = await apiClient.patch<User>("/users/me", data);
    return res.data;
  }
};
