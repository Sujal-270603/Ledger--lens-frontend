import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useClients } from '@/hooks/useInvoices';
import type { InvoiceStatus, SyncStatus } from '@/types/invoice.types';

interface InvoiceFiltersProps {
  status: InvoiceStatus | 'ALL';
  setStatus: (status: InvoiceStatus | 'ALL') => void;
  clientId: string | 'ALL';
  setClientId: (clientId: string | 'ALL') => void;
  search: string;
  setSearch: (search: string) => void;
  syncStatus: SyncStatus | 'ALL';
  setSyncStatus: (status: SyncStatus | 'ALL') => void;
  onClear: () => void;
}

export function InvoiceFilters({
  status,
  setStatus,
  clientId,
  setClientId,
  search,
  setSearch,
  syncStatus,
  setSyncStatus,
  onClear,
}: InvoiceFiltersProps) {
  const { data: clients = [] } = useClients();

  const clientOptions = [
    { value: 'ALL', label: 'All Clients' },
    ...clients.map(c => ({ value: c.id, label: c.name }))
  ];

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'SUBMITTED', label: 'Pending Approval' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'FAILED', label: 'Failed' },
  ];

  const syncOptions = [
    { value: 'ALL', label: 'All Sync Status' },
    { value: 'NOT_SYNCED', label: 'Not Synced' },
    { value: 'SYNCED', label: 'Synced' },
    { value: 'ERROR', label: 'Sync Error' },
  ];

  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          placeholder="Search invoice number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4 text-slate-400" />}
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as unknown as any)}
          options={statusOptions}
        />
        <Select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          options={clientOptions}
        />
        <Select
          value={syncStatus}
          onChange={(e) => setSyncStatus(e.target.value as unknown as any)}
          options={syncOptions}
        />
      </div>
      
      {(status !== 'ALL' || clientId !== 'ALL' || search !== '' || syncStatus !== 'ALL') && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground hover:text-navy-900">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
