import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboard.api';
import type { TrendPeriod } from '@/types/dashboard.types';

export function useDashboardOverview() {
  return useQuery({
    queryKey:  ['dashboard', 'overview'],
    queryFn:   dashboardApi.getOverview,
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useInvoiceTrend(period: TrendPeriod) {
  return useQuery({
    queryKey:  ['dashboard', 'trend', period],
    queryFn:   () => dashboardApi.getInvoiceTrend(period),
    staleTime: 60 * 1000,
  });
}

export function useTopClients(period: TrendPeriod) {
  return useQuery({
    queryKey:  ['dashboard', 'top-clients', period],
    queryFn:   () => dashboardApi.getTopClients(period),
    staleTime: 60 * 1000,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey:  ['dashboard', 'activity'],
    queryFn:   dashboardApi.getRecentActivity,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}
