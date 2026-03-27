import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Users, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useClient, useDeleteClient, useClientInvoices } from '@/hooks/useClients';
import { useAuth } from '@/hooks/useAuth';
import { ClientFormModal } from './ClientFormModal';
import { AssignUserModal } from './AssignUserModal';
import { ClientLedgerTab } from './ClientLedgerTab';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import type { InvoiceStatus, InvoiceListFilters } from '@/types/invoice.types';

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'invoices' | 'users' | 'ledger'>('invoices');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignUserOpen, setAssignUserOpen] = useState(false);
  
  const [invoiceFilters, setInvoiceFilters] = useState<InvoiceListFilters>({ page: 1, limit: 10 });

  const { data: client, isLoading: isClientLoading } = useClient(id || '');
  const { data: invoiceData, isLoading: isInvoicesLoading } = useClientInvoices(id || '', invoiceFilters);
  const deleteMut = useDeleteClient();

  const clientInvoices = invoiceData?.data || [];
  const clientInvoicesMeta = invoiceData?.meta || { totalPages: 1, page: 1 };

  if (isClientLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-4 gap-4"><Skeleton className="h-24 col-span-4" /></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <h2 className="text-xl font-bold">Client not found</h2>
        <Button onClick={() => navigate('/clients')} className="mt-4">Back to Clients</Button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (id) {
      await deleteMut.mutateAsync(id);
      navigate('/clients');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="h-12 w-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xl shrink-0">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-navy-900">{client.name}</h1>
              {client.gstin && (
                <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200 font-mono">
                  {client.gstin}
                </code>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Client ID: {client.id.split('-')[0]}
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-2 self-start sm:self-auto ml-16 sm:ml-0">
            <Button variant="outline" onClick={() => setEditModalOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button variant="outline" className="text-destructive hover:bg-red-50 hover:text-red-700 hover:border-red-200" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        )}
      </div>

      {/* Info cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Invoices</p>
          <p className="text-2xl font-bold text-navy-900">{client._count.invoices}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Email</p>
          <p className="text-sm font-medium text-navy-900 truncate">{client.email || '—'}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Phone</p>
          <p className="text-sm font-medium text-navy-900">{client.phone || '—'}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Client Since</p>
          <p className="text-sm font-medium text-navy-900">{formatDate(client.createdAt)}</p>
        </CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="border-b flex overflow-x-auto scbar-hide">
        {[
          { key: 'invoices', label: 'Invoices' },
          { key: 'ledger',   label: 'Ledger & Accounting' },
          { key: 'users',    label: 'Assigned Users' },
        ].map(tab => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              "px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              activeTab === tab.key
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
            )}
          >{tab.label}</button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            {/* Status filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 scbar-hide">
              {['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'].map(s => {
                const isActive = s === 'ALL' ? !invoiceFilters.status : invoiceFilters.status === s;
                return (
                  <button key={s}
                    onClick={() => setInvoiceFilters(f => ({ ...f, status: s === 'ALL' ? undefined : s as InvoiceStatus, page: 1 }))}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                      isActive
                        ? "bg-navy-900 text-white border-navy-900"
                        : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"
                    )}
                  >{s}</button>
                );
              })}
            </div>

            {isInvoicesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
              </div>
            ) : clientInvoices.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No invoices found"
                description="This client doesn't have any invoices matching the criteria."
              />
            ) : (
              <div className="space-y-3">
                {clientInvoices.map(inv => (
                  <div key={inv.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-white hover:border-brand-300 hover:shadow-sm cursor-pointer transition-all gap-4"
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-navy-900">{inv.invoiceNumber}</p>
                        <StatusBadge status={inv.status} />
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        {formatDate(inv.invoiceDate)}
                        {inv.syncStatus === 'SYNCED' && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 rounded border border-emerald-100">SYNCED</span>}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-semibold text-lg text-navy-900 tracking-tight">{formatCurrency(inv.totalAmount)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">GST: {formatCurrency(inv.gstAmount)}</p>
                    </div>
                  </div>
                ))}
                
                {clientInvoicesMeta.totalPages > 1 && (
                  <Pagination
                    page={invoiceFilters.page || 1}
                    totalPages={clientInvoicesMeta.totalPages}
                    onPageChange={p => setInvoiceFilters(f => ({ ...f, page: p }))}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
              <div>
                <h3 className="font-medium text-navy-900">Manage Access</h3>
                <p className="text-sm text-muted-foreground">Assign team members to manage this client's invoices and documents.</p>
              </div>
              {isAdmin && (
                <Button onClick={() => setAssignUserOpen(true)} size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  Assign Users
                </Button>
              )}
            </div>
            
            {(!client.assignedUsers || client.assignedUsers.length === 0) ? (
              <EmptyState
                icon={Users}
                title="No users assigned"
                description="Assign team members to manage this client."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {client.assignedUsers.map(user => (
                  <div key={user.id} className="p-4 border rounded-xl bg-white flex items-center justify-between">
                    <div>
                      <p className="font-medium text-navy-900">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge className="bg-gray-50 text-gray-500 font-normal">
                      {typeof user.role === 'string' ? user.role : user.role?.name || 'User'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ledger' && id && (
          <ClientLedgerTab clientId={id} />
        )}
      </div>

      <ClientFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        client={client}
        onSuccess={() => setEditModalOpen(false)}
      />

      {id && (
        <AssignUserModal
          clientId={id}
          open={assignUserOpen}
          onOpenChange={setAssignUserOpen}
        />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Client"
        description={`Are you sure you want to delete "${client.name}"? This action cannot be undone.`}
        variant="destructive"
        onConfirm={handleDelete}
        isPending={deleteMut.isPending}
        onOpenChange={(open) => !open && setDeleteDialogOpen(false)}
      />
    </div>
  );
}
