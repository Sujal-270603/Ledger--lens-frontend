import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useClientList, useDeleteClient } from '@/hooks/useClients';
import { useAuth } from '@/hooks/useAuth';
import { ClientCard } from './ClientCard';
import { ClientFormModal } from './ClientFormModal';
import type { ClientDetailItem } from '@/types/client.types';

export default function ClientsPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<ClientDetailItem | null>(null);
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);

  // Simple debounce (in real app use a custom hook or lodash/useDebounce)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on new search
    }, 400);
    return () => clearTimeout(handler);
  }, [search]); // using a trick, actually the effect isn't perfect this way. Let's use standard.

  const { data, isLoading } = useClientList({ search: debouncedSearch, page, limit: 20 });
  const clients = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };

  const deleteMut = useDeleteClient();

  const handleDelete = async () => {
    if (deleteClientId) {
      await deleteMut.mutateAsync(deleteClientId);
      setDeleteClientId(null);
    }
  };

  const openEditModal = (client: ClientDetailItem | any) => {
    setEditClient(client);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">Clients</h1>
          <p className="text-muted-foreground mt-1">
            {meta.total} clients total
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients by name or GSTIN..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Client grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl w-full" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No clients yet"
          description={debouncedSearch ? "No clients match your search query." : "Add your first client to start managing their invoices."}
          action={!debouncedSearch ? { label: 'Add Client', onClick: () => setCreateModalOpen(true) } : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {clients.map(client => (
              <ClientCard
                key={client.id}
                client={client}
                onEdit={(e) => { e.stopPropagation(); openEditModal(client); }}
                onDelete={(e) => { e.stopPropagation(); setDeleteClientId(client.id); }}
                onClick={() => navigate(`/clients/${client.id}`)}
              />
            ))}
          </div>

          <Pagination 
            page={meta.page} 
            totalPages={meta.totalPages} 
            onPageChange={setPage} 
          />
        </>
      )}

      {/* Modals and Dialogs */}
      <ClientFormModal
        open={createModalOpen || !!editClient}
        onOpenChange={(open) => {
          setCreateModalOpen(open);
          if (!open) setEditClient(null);
        }}
        client={editClient || undefined}
        onSuccess={() => {
          setCreateModalOpen(false);
          setEditClient(null);
        }}
      />

      <ConfirmDialog
        open={!!deleteClientId}
        title="Delete Client"
        description="This will permanently delete the client. This cannot be done if they have approved invoices."
        variant="destructive"
        onConfirm={handleDelete}
        isPending={deleteMut.isPending}
        onOpenChange={(open) => !open && setDeleteClientId(null)}
      />

    </div>
  );
}
