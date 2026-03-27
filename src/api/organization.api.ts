import api from './axios';
import type { OrganizationResponse, UpdateOrganizationInput } from '@/types/organization.types';

export const organizationApi = {
  getOrganization: async (): Promise<OrganizationResponse> => {
    const res = await api.get('/organization');
    return res.data;
  },

  updateOrganization: async (
    data: UpdateOrganizationInput
  ): Promise<OrganizationResponse> => {
    const res = await api.patch('/organization', data);
    return res.data;
  }
};
