import api from './axios';
import type { 
  ClientListItem, 
  ClientDetailItem, 
  CreateClientInput, 
  UpdateClientInput, 
  ClientListFilters, 
  UserListItem 
} from '@/types/client.types';
import type { InvoiceListItem, InvoiceListFilters } from '@/types/invoice.types';

export const clientApi = {
  listClients: async (filters: ClientListFilters): Promise<{
    data: ClientListItem[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> => {
    const res = await api.get('/clients', { params: filters });
    return res.data;
  },

  getClient: async (id: string): Promise<ClientDetailItem> => {
    const res = await api.get(`/clients/${id}`);
    return res.data;
  },

  createClient: async (data: CreateClientInput): Promise<ClientDetailItem> => {
    const res = await api.post('/clients', data);
    return res.data;
  },

  updateClient: async (id: string, data: UpdateClientInput): Promise<ClientDetailItem> => {
    const res = await api.patch(`/clients/${id}`, data);
    return res.data;
  },

  deleteClient: async (id: string): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },

  getClientInvoices: async (
    clientId: string,
    filters: InvoiceListFilters
  ): Promise<{
    data: InvoiceListItem[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> => {
    const res = await api.get(`/clients/${clientId}/invoices`, { params: filters });
    return res.data;
  },

  assignUserToClient: async (
    clientId: string,
    userId: string
  ): Promise<{ message: string }> => {
    const res = await api.post(`/clients/${clientId}/users`, { userId });
    return res.data;
  },

  removeUserFromClient: async (
    clientId: string,
    userId: string
  ): Promise<void> => {
    await api.delete(`/clients/${clientId}/users/${userId}`);
  },

  listUsers: async (): Promise<UserListItem[]> => {
    const res = await api.get('/users', { params: { page: 1, limit: 100 } });
    return res.data.data;
  }
};
