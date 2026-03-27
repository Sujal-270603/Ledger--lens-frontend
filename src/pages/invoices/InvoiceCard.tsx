import { formatCurrency, formatDate } from '@/lib/utils';
import type { InvoiceListItem } from '@/types/invoice.types';
import { StatusBadge } from '@/components/ui/status-badge';
import { Building2, Calendar, Cloud, CloudLightning, CloudOff, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InvoiceCardProps {
  invoice: InvoiceListItem;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const navigate = useNavigate();

  const SyncIcon = () => {
    switch (invoice.syncStatus) {
      case 'SYNCED': return <div title="Synced"><Cloud className="h-4 w-4 text-green-500" /></div>;
      case 'ERROR': return <div title="Sync error"><CloudLightning className="h-4 w-4 text-red-500" /></div>;
      default: return <div title="Not synced"><CloudOff className="h-4 w-4 text-slate-300" /></div>;
    }
  };

  return (
    <div 
      onClick={() => navigate(`/invoices/${invoice.id}`)}
      className="group flex flex-col p-5 rounded-xl border bg-white shadow-sm hover:shadow-md hover:border-brand-200 cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-navy-900 group-hover:text-brand-600 transition-colors">
            {invoice.invoiceNumber}
          </h4>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <Calendar className="h-3 w-3" />
            {formatDate(invoice.invoiceDate)}
          </div>
        </div>
        <div className="flex items-start gap-2">
          {(invoice.status === 'DRAFT' || invoice.status === 'REJECTED') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/invoices/${invoice.id}/edit`);
              }}
              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
              title="Edit Invoice"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          <StatusBadge status={invoice.status} />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center shrink-0">
          <Building2 className="h-4 w-4 text-slate-400" />
        </div>
        <span className="text-sm font-medium text-slate-700 truncate">
          {invoice.client?.name || 'Unknown Client'}
        </span>
      </div>

      <div className="mt-auto pt-4 border-t flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Amount</p>
          <p className="font-semibold text-navy-900">{formatCurrency(invoice.totalAmount)}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
          <SyncIcon />
          <span className="text-xs font-medium text-slate-600">
            {invoice.syncStatus === 'SYNCED' ? 'Synced' : invoice.syncStatus === 'ERROR' ? 'Sync Error' : 'Local'}
          </span>
        </div>
      </div>
    </div>
  );
}
