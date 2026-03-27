import { formatCurrency, formatDate } from '@/lib/utils';
import type { InvoiceListItem } from '@/types/invoice.types';
import { StatusBadge } from '@/components/ui/status-badge';
import { Building2, CloudOff, Cloud, CloudLightning, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InvoiceRowProps {
  invoice: InvoiceListItem;
}

export function InvoiceRow({ invoice }: InvoiceRowProps) {
  const navigate = useNavigate();

  const SyncIcon = () => {
    switch (invoice.syncStatus) {
      case 'SYNCED': return <div title="Synced to accounting software"><Cloud className="h-4 w-4 text-green-500" /></div>;
      case 'ERROR': return <div title="Sync error"><CloudLightning className="h-4 w-4 text-red-500" /></div>;
      default: return <div title="Not synced"><CloudOff className="h-4 w-4 text-slate-300" /></div>;
    }
  };

  return (
    <tr 
      onClick={() => navigate(`/invoices/${invoice.id}`)}
      className="group border-b last:border-0 hover:bg-slate-50/80 cursor-pointer transition-colors"
    >
      <td className="py-4 px-4 whitespace-nowrap">
        <div className="font-medium text-navy-900 group-hover:text-brand-600 transition-colors">
          {invoice.invoiceNumber}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {formatDate(invoice.invoiceDate)}
        </div>
      </td>
      <td className="py-4 px-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center shrink-0">
            <Building2 className="h-4 w-4 text-slate-400" />
          </div>
          <span className="font-medium text-slate-700 truncate max-w-[200px]">
            {invoice.client?.name || 'Unknown Client'}
          </span>
        </div>
      </td>
      <td className="py-4 px-4 whitespace-nowrap text-right">
        <div className="font-medium text-navy-900">
          {formatCurrency(invoice.totalAmount)}
        </div>
      </td>
      <td className="py-4 px-4 whitespace-nowrap">
        <StatusBadge status={invoice.status} />
      </td>
      <td className="py-2 px-4 whitespace-nowrap text-center">
        <div className="flex items-center justify-center">
          <SyncIcon />
        </div>
      </td>
      <td className="py-2 px-4 whitespace-nowrap text-right">
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
      </td>
    </tr>
  );
}
