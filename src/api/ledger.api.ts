import api from './axios';
import type { 
  LedgerFilters, 
  LedgerListItem, 
  LedgerDetailItem, 
  LedgerBalanceSummary, 
  CreateLedgerInput,
  JournalEntryFilters,
  JournalEntryResponse,
  CreateJournalEntryInput
} from '@/types/ledger.types';

export const ledgerApi = {
  listLedgers: async (clientId: string, filters: LedgerFilters): Promise<{
    data: LedgerListItem[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> => {
    const res = await api.get(`/clients/${clientId}/ledgers`, { params: filters });
    return res.data;
  },

  getBalanceSummary: async (clientId: string): Promise<LedgerBalanceSummary[]> => {
    const res = await api.get(`/clients/${clientId}/ledgers/balance-summary`);
    return res.data.data;
  },

  getLedger: async (clientId: string, id: string): Promise<LedgerDetailItem> => {
    const res = await api.get(`/clients/${clientId}/ledgers/${id}`);
    return res.data.data;
  },

  createLedger: async (clientId: string, data: CreateLedgerInput): Promise<LedgerDetailItem> => {
    const res = await api.post(`/clients/${clientId}/ledgers`, data);
    return res.data.data;
  },

  updateLedger: async (clientId: string, id: string, name: string): Promise<LedgerDetailItem> => {
    const res = await api.patch(`/clients/${clientId}/ledgers/${id}`, { name });
    return res.data.data;
  },

  deleteLedger: async (clientId: string, id: string): Promise<void> => {
    await api.delete(`/clients/${clientId}/ledgers/${id}`);
  },

  listJournalEntries: async (clientId: string, filters: JournalEntryFilters): Promise<{
    data: JournalEntryResponse[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> => {
    const res = await api.get(`/clients/${clientId}/journal-entries`, { params: filters });
    return res.data;
  },

  getJournalEntry: async (clientId: string, id: string): Promise<JournalEntryResponse> => {
    const res = await api.get(`/clients/${clientId}/journal-entries/${id}`);
    return res.data.data;
  },

  createJournalEntry: async (clientId: string, data: CreateJournalEntryInput): Promise<JournalEntryResponse> => {
    const res = await api.post(`/clients/${clientId}/journal-entries`, data);
    return res.data.data;
  },

  deleteJournalEntry: async (clientId: string, id: string): Promise<void> => {
    await api.delete(`/clients/${clientId}/journal-entries/${id}`);
  }
};
