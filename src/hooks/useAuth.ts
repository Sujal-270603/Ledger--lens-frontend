import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate    = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess:  (data) => {
      setAuth(
        { accessToken: data.accessToken, refreshToken: data.refreshToken },
        data.user
      );
      navigate('/dashboard');
    },
  });
}

export function useSignup() {
  const { setAuth } = useAuthStore();
  const navigate    = useNavigate();

  return useMutation({
    mutationFn: authApi.signup,
    onSuccess:  (data) => {
      setAuth(data.tokens, data.user);
      navigate('/dashboard');
    },
  });
}

export function useLogout() {
  const { clearAuth, refreshToken } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) await authApi.logout(refreshToken);
    },
    onSettled: () => {
      clearAuth();
      navigate('/login');
    },
  });
}

export function useMe() {
  const { isAuthenticated, setUser } = useAuthStore();

  return useQuery({
    queryKey:  ['me'],
    queryFn:   async () => {
      const res = await authApi.me();
      setUser(res.data);
      return res.data;
    },
    enabled:   isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}
export function useAuth() {
  const { user, isAuthenticated, isAdmin, getRole } = useAuthStore();
  return {
    user,
    isAuthenticated,
    isAdmin: isAdmin(),
    role: getRole(),
  };
}
