import api from './axios';
import type {
  DashboardOverview, InvoiceTrend,
  TopClient, RecentActivity, TrendPeriod,
} from '@/types/dashboard.types';

export const dashboardApi = {
  getOverview: async (): Promise<DashboardOverview> => {
    const res = await api.get<DashboardOverview>('/dashboard/overview');
    return res.data;
  },

  getInvoiceTrend: async (period?: TrendPeriod): Promise<InvoiceTrend> => {
    const res = await api.get<InvoiceTrend>(`/dashboard/trends${period ? `?period=${period}` : ''}`);
    return res.data;
  },

  getTopClients: async (period?: TrendPeriod): Promise<TopClient[]> => {
    const res = await api.get<TopClient[]>(`/dashboard/top-clients${period ? `?period=${period}` : ''}`);
    return res.data;
  },

  getRecentActivity: async (): Promise<RecentActivity[]> => {
    const res = await api.get<RecentActivity[]>('/dashboard/recent-activity');
    return res.data;
  },
};
