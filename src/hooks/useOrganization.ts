import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationApi } from '@/api/organization.api';
import { authApi } from '@/api/auth.api';
import { toast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/stores/auth.store';
import { useNavigate } from 'react-router-dom';

export function useOrganization() {
  return useQuery({
    queryKey: ['organization'],
    queryFn: organizationApi.getOrganization,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: organizationApi.updateOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      toast.success('Organization updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update organization');
    },
  });
}

export function useChangePassword() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully. Please log in again.');
      setTimeout(() => {
        clearAuth();
        navigate('/login');
      }, 1500);
    },
    onError: (error: any) => {
      const status = error.response?.status;
      if (status === 401) {
        toast.error('Current password is incorrect');
      } else if (status === 400) {
        toast.error('New password cannot be the same as current password');
      } else {
        toast.error(error.message || 'Failed to change password');
      }
    },
  });
}
