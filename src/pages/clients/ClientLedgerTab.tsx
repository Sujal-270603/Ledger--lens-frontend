import { useState } from 'react';
import { Plus, Search, BookOpen, ScrollText, Filter, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';

import { useLedgerList, useBalanceSummary, useJournalEntries, useDeleteLedger, useDeleteJournalEntry } from '@/hooks/useLedger';
import { BalanceSummaryTable } from '../ledger/BalanceSummaryTable';
import { LedgerCard } from '../ledger/LedgerCard';
import { LedgerFormModal } from '../ledger/LedgerFormModal';
import { JournalEntryCard } from '../ledger/JournalEntryCard';
import { JournalEntryDetailModal } from '../ledger/JournalEntryDetailModal';
import { CreateJournalEntryModal } from '../ledger/CreateJournalEntryModal';
import type { LedgerListItem, JournalEntryResponse } from '@/types/ledger.types';

interface ClientLedgerTabProps {
  clientId: string;
}

export function ClientLedgerTab({ clientId }: ClientLedgerTabProps) {
  const { hasPermission } = useAuthStore();
  const [activeSubTab, setActiveSubTab] = useState<'accounts' | 'entries'>('accounts');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [editingLedger, setEditingLedger] = useState<LedgerListItem | undefined>();
  const [deleteLedgerId, setDeleteLedgerId] = useState<string | null>(null);

  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<JournalEntryResponse | null>(null);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);

  // Queries
  const { data: ledgers, isLoading: ledgersLoading } = useLedgerList(clientId, { search: searchTerm, page, limit: 12 });
  const { data: balanceSum, isLoading: balanceLoading } = useBalanceSummary(clientId);
  const { data: entries, isLoading: entriesLoading } = useJournalEntries(clientId, { page, limit: 10 });

  const deleteLedgerMut = useDeleteLedger(clientId);
  const deleteEntryMut = useDeleteJournalEntry(clientId);

  const handleTabChange = (tab: 'accounts' | 'entries') => {
    setActiveSubTab(tab);
    setPage(1);
    setSearchTerm('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Tab Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex p-1 bg-slate-100 rounded-lg w-fit">
          <button
            onClick={() => handleTabChange('accounts')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
              activeSubTab === 'accounts' ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <BookOpen className="h-4 w-4" />
            Accounts / Trial Balance
          </button>
          <button
            onClick={() => handleTabChange('entries')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
              activeSubTab === 'entries' ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <List className="h-4 w-4" />
            Journal Entries
          </button>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('MANAGE_LEDGER') && (
            <Button onClick={() => setLedgerModalOpen(true)} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          )}
          {hasPermission('MANAGE_JOURNAL') && (
            <Button onClick={() => setEntryModalOpen(true)} size="sm">
              <ScrollText className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          )}
        </div>
      </div>

      {activeSubTab === 'accounts' ? (
        <div className="space-y-6">
          {/* Trial Balance Section */}
          <Card className="border-brand-100 shadow-sm overflow-hidden">
            <div className="bg-brand-50/50 border-b border-brand-100 px-6 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-brand-900 flex items-center gap-2 text-sm">
                <Filter className="h-3.5 w-3.5" /> Trial Balance Summary
              </h2>
            </div>
            <CardContent className="p-0">
              <BalanceSummaryTable summary={balanceSum || []} isLoading={balanceLoading} />
            </CardContent>
          </Card>

          {/* Accounts Grid Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-navy-900">Chart of Accounts</h2>
              <div className="relative max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 h-9"
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {ledgersLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <Card key={i} className="h-28 animate-pulse bg-slate-50 border-0" />)}
              </div>
            ) : ledgers?.data.length === 0 ? (
              <EmptyState 
                icon={BookOpen} 
                title="No accounts found" 
                description="Create custom ledger accounts to categorize your transactions."
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ledgers?.data.map((l) => (
                    <LedgerCard
                      key={l.id}
                      ledger={l}
                      onEdit={() => { setEditingLedger(l); setLedgerModalOpen(true); }}
                      onDelete={() => setDeleteLedgerId(l.id)}
                    />
                  ))}
                </div>
                <Pagination
                  page={page}
                  totalPages={ledgers?.meta.totalPages || 1}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-navy-900">Journal History</h2>
          </div>

          {entriesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Card key={i} className="h-20 animate-pulse bg-slate-50 border-0" />)}
            </div>
          ) : entries?.data.length === 0 ? (
            <EmptyState 
              icon={ScrollText} 
              title="No entries recorded" 
              description="Approve invoices or create manual entries to see them here."
              action={hasPermission('MANAGE_JOURNAL') ? { label: "New Entry", onClick: () => setEntryModalOpen(true) } : undefined}
            />
          ) : (
            <>
              <div className="space-y-3">
                {entries?.data.map((e) => (
                  <JournalEntryCard 
                    key={e.id} 
                    entry={e} 
                    onView={() => setViewingEntry(e)} 
                  />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={entries?.meta.totalPages || 1}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      )}

      {/* Modals */}
      <LedgerFormModal
        open={ledgerModalOpen}
        onOpenChange={(open) => { setLedgerModalOpen(open); if(!open) setEditingLedger(undefined); }}
        clientId={clientId}
        ledger={editingLedger}
        onSuccess={() => { setLedgerModalOpen(false); setEditingLedger(undefined); }}
      />

      <CreateJournalEntryModal
        open={entryModalOpen}
        onOpenChange={setEntryModalOpen}
        clientId={clientId}
        onSuccess={() => setEntryModalOpen(false)}
      />

      <JournalEntryDetailModal
        open={!!viewingEntry}
        onOpenChange={(open) => !open && setViewingEntry(null)}
        entry={viewingEntry}
        onDelete={(id) => setDeleteEntryId(id)}
        isDeleting={deleteEntryMut.isPending}
      />

      <ConfirmDialog
        open={!!deleteLedgerId}
        onOpenChange={(open) => !open && setDeleteLedgerId(null)}
        title="Delete Ledger Account"
        description="Are you sure? Custom accounts can only be deleted if they have no associated journal entries."
        variant="destructive"
        isPending={deleteLedgerMut.isPending}
        onConfirm={async () => {
          if (deleteLedgerId) {
            await deleteLedgerMut.mutateAsync(deleteLedgerId);
            setDeleteLedgerId(null);
          }
        }}
      />

      <ConfirmDialog
        open={!!deleteEntryId}
        onOpenChange={(open) => !open && setDeleteEntryId(null)}
        title="Delete Journal Entry"
        description="Are you sure? Manual entries will be permanently deleted. This cannot be done for auto-generated entries."
        variant="destructive"
        isPending={deleteEntryMut.isPending}
        onConfirm={async () => {
          if (deleteEntryId) {
            await deleteEntryMut.mutateAsync(deleteEntryId);
            setDeleteEntryId(null);
            setViewingEntry(null);
          }
        }}
      />
    </div>
  );
}
