import api from './axios';
import type { 
  UserListFilters, 
  UserDetailItem, 
  RoleItem, 
  InviteUserInput 
} from '@/types/user.types';

export const userApi = {
  listUsers: async (filters: UserListFilters): Promise<{
    data: UserDetailItem[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> => {
    const res = await api.get('/users', { params: filters });
    return res.data;
  },

  getRoles: async (): Promise<RoleItem[]> => {
    const res = await api.get('/users/roles');
    return res.data;
  },

  inviteUser: async (data: InviteUserInput): Promise<UserDetailItem> => {
    const res = await api.post('/users/invite', data);
    return res.data;
  },

  getUser: async (id: string): Promise<UserDetailItem> => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  getUserPermissions: async (id: string): Promise<string[]> => {
    const res = await api.get(`/users/${id}/permissions`);
    return res.data.permissions;
  },

  updateUserRole: async (id: string, roleId: string): Promise<UserDetailItem> => {
    const res = await api.patch(`/users/${id}/role`, { roleId });
    return res.data;
  },

  updateUserStatus: async (id: string, isActive: boolean): Promise<void> => {
    await api.patch(`/users/${id}/status`, { isActive });
  }
};
