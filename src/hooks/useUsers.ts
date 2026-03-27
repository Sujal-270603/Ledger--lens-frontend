import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { userApi } from '@/api/user.api';
import type { UserListFilters } from '@/types/user.types';
import { toast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/lib/utils';

function extractFieldErrors(error: unknown): string {
  const data = (error as any)?.response?.data;
  if (data?.errors?.length > 0) {
    return data.errors.map((e: any) => e.message).join('. ');
  }
  return data?.message || 'Validation failed';
}

export function useUserList(filters: UserListFilters) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userApi.listUsers(filters),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => userApi.getRoles(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userApi.getUser(id),
    enabled: !!id,
  });
}

export function useUserPermissions(id: string) {
  return useQuery({
    queryKey: ['user-permissions', id],
    queryFn: () => userApi.getUserPermissions(id),
    enabled: !!id,
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.inviteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User invited successfully');
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        toast.error('This email is already registered');
      } else if (error.response?.status === 422) {
        toast.error(extractFieldErrors(error));
      } else {
        toast.error(getErrorMessage(error));
      }
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, roleId }: { id: string; roleId: string }) => userApi.updateUserRole(id, roleId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      toast.success('Role updated successfully');
    },
    onError: (error: any) => {
      if (error.response?.status === 400) {
        toast.error('You cannot change your own role');
      } else {
        toast.error(getErrorMessage(error));
      }
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => userApi.updateUserStatus(id, isActive),
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(isActive ? 'User activated' : 'User deactivated');
    },
    onError: (error: any, { isActive }) => {
      const action = isActive ? 'activate' : 'deactivate';
      if (error.response?.status === 400) {
        toast.error(`You cannot ${action} your own account`);
      } else {
        toast.error(getErrorMessage(error));
      }
    },
  });
}
