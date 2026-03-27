import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { clientApi } from '@/api/client.api';
import type { ClientListFilters, UpdateClientInput } from '@/types/client.types';
import type { InvoiceListFilters } from '@/types/invoice.types';
import { toast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/lib/utils';

export function useClientList(filters: ClientListFilters) {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: () => clientApi.listClients(filters),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => clientApi.getClient(id),
    enabled: !!id,
  });
}

export function useClientInvoices(clientId: string, filters: InvoiceListFilters) {
  return useQuery({
    queryKey: ['client-invoices', clientId, filters],
    queryFn: () => clientApi.getClientInvoices(clientId, filters),
    enabled: !!clientId,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clientApi.createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients-simple-list'] });
      toast.success('Client created successfully');
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        toast.error('A client with this GSTIN already exists');
      } else {
        toast.error(getErrorMessage(error));
      }
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientInput }) => clientApi.updateClient(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      toast.success('Client updated successfully');
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        toast.error('GSTIN already in use by another client');
      } else {
        toast.error(getErrorMessage(error));
      }
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clientApi.deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients-simple-list'] });
      toast.success('Client deleted');
    },
    onError: (error: any) => {
      if (error.response?.status === 422) {
        toast.error('Cannot delete client with approved invoices');
      } else {
        toast.error(getErrorMessage(error));
      }
    },
  });
}

export function useAssignUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, userId }: { clientId: string, userId: string }) => clientApi.assignUserToClient(clientId, userId),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      toast.success('User assigned to client');
    },
  });
}

export function useRemoveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, userId }: { clientId: string, userId: string }) => clientApi.removeUserFromClient(clientId, userId),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      toast.success('User removed from client');
    },
  });
}

export function useUserList() {
  return useQuery({
    queryKey: ['users-list'],
    queryFn: clientApi.listUsers,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSimpleClientList() {
  return useQuery({
    queryKey: ['clients-simple-list'],
    queryFn: async () => {
      const res = await clientApi.listClients({ page: 1, limit: 100 });
      return res.data; // Already the array ClientListItem[]
    },
    staleTime: 5 * 60 * 1000,
  });
}
