import api from './axios';
import type {
  InvoiceListFilters,
  InvoiceListItem,
  CreateInvoiceInput,
  InvoiceResponse,
  InvoiceItemResponse,
  InvoiceHistoryEntry,
  JournalEntryResponse,
  ClientItem,
  WorkflowActionResponse,
} from '@/types/invoice.types';

export const invoiceApi = {
  listInvoices: async (filters: InvoiceListFilters): Promise<{
    data: InvoiceListItem[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.clientId) params.append('clientId', filters.clientId);
    if (filters.syncStatus) params.append('syncStatus', filters.syncStatus);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const res = await api.get<{ data: InvoiceListItem[]; meta: any }>(`/invoices?${params.toString()}`);
    return res.data;
  },

  createInvoice: async (data: CreateInvoiceInput): Promise<InvoiceResponse> => {
    const res = await api.post<{ status: string; data: InvoiceResponse }>('/invoices', data);
    return res.data.data;
  },

  getInvoice: async (id: string): Promise<InvoiceResponse> => {
    const res = await api.get<{ status: string; data: InvoiceResponse }>(`/invoices/${id}`);
    return res.data.data;
  },

  updateInvoice: async (id: string, data: Partial<CreateInvoiceInput>): Promise<InvoiceResponse> => {
    const res = await api.put<{ status: string; data: InvoiceResponse }>(`/invoices/${id}`, data);
    return res.data.data;
  },

  deleteInvoice: async (id: string): Promise<void> => {
    await api.delete(`/invoices/${id}`);
  },

  getInvoiceItems: async (id: string): Promise<InvoiceItemResponse[]> => {
    // Usually part of getInvoice, but if a separate endpoint exists:
    const res = await api.get<{ status: string; data: InvoiceItemResponse[] }>(`/invoices/${id}/items`);
    return res.data.data;
  },

  submitInvoice: async (id: string): Promise<WorkflowActionResponse> => {
    const res = await api.post<{ data: WorkflowActionResponse }>(`/invoices/${id}/submit`);
    return res.data.data;
  },

  approveInvoice: async (id: string): Promise<WorkflowActionResponse> => {
    const res = await api.post<{ data: WorkflowActionResponse }>(`/invoices/${id}/approve`);
    return res.data.data;
  },

  rejectInvoice: async (id: string, rejectionReason: string): Promise<WorkflowActionResponse> => {
    const res = await api.post<{ data: WorkflowActionResponse }>(`/invoices/${id}/reject`, { rejectionReason });
    return res.data.data;
  },

  reopenInvoice: async (id: string, reopenReason: string): Promise<WorkflowActionResponse> => {
    const res = await api.post<{ data: WorkflowActionResponse }>(`/invoices/${id}/reopen`, { reopenReason });
    return res.data.data;
  },

  getInvoiceHistory: async (id: string): Promise<InvoiceHistoryEntry[]> => {
    const res = await api.get<{ status: string; data: InvoiceHistoryEntry[] }>(`/invoices/${id}/history`);
    return res.data.data;
  },

  getJournalEntries: async (id: string): Promise<JournalEntryResponse[]> => {
    const res = await api.get<{ status: string; data: JournalEntryResponse[] }>(`/invoices/${id}/journal-entries`);
    return res.data.data;
  },

  listClients: async (): Promise<ClientItem[]> => {
    const res = await api.get<{ data: ClientItem[]; meta: any }>('/clients?page=1&limit=100');
    return res.data.data;
  },
};
