import api from './axios';
import type {
  LoginInput, LoginResponse,
  SignupInput, SignupResponse,
  MeResponse,
} from '@/types/auth.types';

export const authApi = {
  login: async (data: LoginInput): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/login', data);
    return res.data;
  },

  signup: async (data: SignupInput): Promise<SignupResponse> => {
    const res = await api.post<SignupResponse>('/auth/signup', data);
    return res.data;
  },

  me: async (): Promise<MeResponse> => {
    const res = await api.get<MeResponse>('/auth/me');
    return res.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken });
  },

  refresh: async (refreshToken: string) => {
    const res = await api.post('/auth/refresh', { refreshToken });
    return res.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
    const res = await api.patch('/auth/change-password', data);
    return res.data;
  }
};
