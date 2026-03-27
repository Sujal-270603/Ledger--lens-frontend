import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { ledgerApi } from '@/api/ledger.api';
import type { LedgerFilters, JournalEntryFilters, CreateLedgerInput, CreateJournalEntryInput } from '@/types/ledger.types';
import { toast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/lib/utils';

export function useLedgerList(clientId: string, filters: LedgerFilters) {
  return useQuery({
    queryKey: ['ledgers', clientId, filters],
    queryFn: () => ledgerApi.listLedgers(clientId, filters),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: !!clientId,
  });
}

export function useBalanceSummary(clientId: string) {
  return useQuery({
    queryKey: ['ledger-balance-summary', clientId],
    queryFn: () => ledgerApi.getBalanceSummary(clientId),
    staleTime: 60 * 1000,
    enabled: !!clientId,
  });
}

export function useLedger(clientId: string, id: string) {
  return useQuery({
    queryKey: ['ledger', clientId, id],
    queryFn: () => ledgerApi.getLedger(clientId, id),
    enabled: !!clientId && !!id,
  });
}

export function useCreateLedger(clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLedgerInput) => ledgerApi.createLedger(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgers', clientId] });
      queryClient.invalidateQueries({ queryKey: ['ledger-balance-summary', clientId] });
      toast.success('Ledger account created');
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        toast.error('A ledger with this name already exists');
      } else {
        toast.error(getErrorMessage(error));
      }
    },
  });
}

export function useUpdateLedger(clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => ledgerApi.updateLedger(clientId, id, name),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['ledgers', clientId] });
      queryClient.invalidateQueries({ queryKey: ['ledger', clientId, id] });
      queryClient.invalidateQueries({ queryKey: ['ledger-balance-summary', clientId] });
      toast.success('Ledger updated');
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteLedger(clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ledgerApi.deleteLedger(clientId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgers', clientId] });
      queryClient.invalidateQueries({ queryKey: ['ledger-balance-summary', clientId] });
      toast.success('Ledger deleted');
    },
    onError: (error: any) => {
      if (error.response?.status === 422) {
        toast.error('Cannot delete a ledger that has journal entries');
      } else {
        toast.error(getErrorMessage(error));
      }
    },
  });
}

export function useJournalEntries(clientId: string, filters: JournalEntryFilters) {
  return useQuery({
    queryKey: ['journal-entries', clientId, filters],
    queryFn: () => ledgerApi.listJournalEntries(clientId, filters),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
    enabled: !!clientId,
  });
}

export function useJournalEntry(clientId: string, id: string) {
  return useQuery({
    queryKey: ['journal-entry', clientId, id],
    queryFn: () => ledgerApi.getJournalEntry(clientId, id),
    enabled: !!clientId && !!id,
  });
}

export function useCreateJournalEntry(clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJournalEntryInput) => ledgerApi.createJournalEntry(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries', clientId] });
      queryClient.invalidateQueries({ queryKey: ['ledger-balance-summary', clientId] });
      queryClient.invalidateQueries({ queryKey: ['ledgers', clientId] });
      toast.success('Journal entry created');
    },
    onError: (error: any) => {
      if (error.response?.status === 422) {
        toast.error(error.response.data.message || 'Validation failed');
      } else {
        toast.error(getErrorMessage(error));
      }
    },
  });
}

export function useDeleteJournalEntry(clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ledgerApi.deleteJournalEntry(clientId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries', clientId] });
      queryClient.invalidateQueries({ queryKey: ['ledger-balance-summary', clientId] });
      queryClient.invalidateQueries({ queryKey: ['ledgers', clientId] });
      toast.success('Journal entry deleted');
    },
    onError: (error: any) => {
      if (error.response?.status === 422) {
        toast.error('Auto-generated entries cannot be deleted');
      } else {
        toast.error(getErrorMessage(error));
      }
    },
  });
}
