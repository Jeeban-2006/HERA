import { createAPIClient } from './client';
import { RegisterInput } from '@/lib/validation';
import { User } from '@/state/auth.store';

const apiClient = createAPIClient();

export interface AuthResponse {
  user: User;
  token: string;
}

export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });
    return data;
  },

  register: async (input: RegisterInput): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/register', {
      email: input.email,
      password: input.password,
      name: input.name,
    });
    return data;
  },

  getProfile: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/api/auth/me');
    return data;
  },

  updateProfile: async (updates: Partial<User>): Promise<User> => {
    const { data } = await apiClient.put<User>('/api/auth/me', updates);
    return data;
  },
};
