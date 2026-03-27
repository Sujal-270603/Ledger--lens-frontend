import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { invoiceApi } from '@/api/invoice.api';
import { useNavigate } from 'react-router-dom';
import type { InvoiceListFilters } from '@/types/invoice.types';

export { useSimpleClientList as useClients } from './useClients';

export function useInvoices(filters: InvoiceListFilters) {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => invoiceApi.listInvoices(filters),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceApi.getInvoice(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useInvoiceHistory(id: string) {
  return useQuery({
    queryKey: ['invoice-history', id],
    queryFn: () => invoiceApi.getInvoiceHistory(id),
    enabled: !!id,
  });
}

export function useJournalEntries(invoiceId: string) {
  return useQuery({
    queryKey: ['journal-entries', invoiceId],
    queryFn: () => invoiceApi.getJournalEntries(invoiceId),
    enabled: !!invoiceId,
  });
}

export function useSubmitInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoiceApi.submitInvoice(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useApproveInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoiceApi.approveInvoice(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['journal-entries', id] });
    },
  });
}

export function useRejectInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => invoiceApi.rejectInvoice(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useReopenInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => invoiceApi.reopenInvoice(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (id: string) => invoiceApi.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate('/invoices');
    },
  });
}

export function useApprovedInvoices(clientId?: string) {
  return useQuery({
    queryKey: ['invoices-approved', clientId],
    queryFn: () => invoiceApi.listInvoices({ status: 'APPROVED', clientId, limit: 100 })
               .then(res => res.data),
    staleTime: 60 * 1000,
  });
}
