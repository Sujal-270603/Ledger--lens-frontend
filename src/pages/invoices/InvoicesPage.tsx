import { useState } from 'react';
import { Receipt, LayoutGrid, List } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import type { InvoiceStatus, SyncStatus } from '@/types/invoice.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { useNavigate } from 'react-router-dom';

import { InvoiceFilters } from './InvoiceFilters';
import { InvoiceRow } from './InvoiceRow';
import { InvoiceCard } from './InvoiceCard';

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  const [status, setStatus] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [clientId, setClientId] = useState<string | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [syncStatus, setSyncStatus] = useState<SyncStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  // Debounce search slightly internally if needed, or rely on react-query's fast fetching if backend is fast. 
  // For a real app, use a debounced value. Assuming simple direct use here.
  
  const filters = {
    page,
    limit: 20,
    ...(status !== 'ALL' && { status }),
    ...(clientId !== 'ALL' && { clientId }),
    ...(search && { search }),
    ...(syncStatus !== 'ALL' && { syncStatus }),
  };

  const { data, isLoading } = useInvoices(filters);
  const invoices = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  const handleClearFilters = () => {
    setStatus('ALL');
    setClientId('ALL');
    setSearch('');
    setSyncStatus('ALL');
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">Invoices</h1>
          <p className="text-muted-foreground mt-1">
            Manage, review, and approve your invoices.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg p-1 border shadow-sm self-start sm:self-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      <InvoiceFilters
        status={status}
        setStatus={(s) => { setStatus(s); setPage(1); }}
        clientId={clientId}
        setClientId={(c) => { setClientId(c); setPage(1); }}
        search={search}
        setSearch={(s) => { setSearch(s); setPage(1); }}
        syncStatus={syncStatus}
        setSyncStatus={(s) => { setSyncStatus(s); setPage(1); }}
        onClear={handleClearFilters}
      />

      {/* Content */}
      {isLoading ? (
        viewMode === 'list' ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        )
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No invoices found"
          description={Object.keys(filters).length > 2 ? "Try adjusting your filters or search query to find what you're looking for." : "Upload documents to automatically generate invoices."}
          action={Object.keys(filters).length > 2 ? { label: "Clear Filters", onClick: handleClearFilters } : { label: "Go to Documents", onClick: () => navigate('/documents') }}
        />
      ) : (
        <>
          {viewMode === 'list' ? (
            <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b text-slate-500 font-medium">
                  <tr>
                    <th className="py-3 px-4 font-medium">Invoice Info</th>
                    <th className="py-3 px-4 font-medium">Client</th>
                    <th className="py-3 px-4 font-medium text-right">Amount</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium text-center">Sync</th>
                    <th className="py-3 px-4 font-medium text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <InvoiceRow key={inv.id} invoice={inv} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {invoices.map((inv) => (
                <InvoiceCard key={inv.id} invoice={inv} />
              ))}
            </div>
          )}

          <Pagination
            page={page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
