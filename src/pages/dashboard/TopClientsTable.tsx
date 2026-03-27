import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Building2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { TopClient } from '@/types/dashboard.types';

interface TopClientsTableProps {
  clients?: TopClient[];
  isLoading?: boolean;
}

export default function TopClientsTable({ clients, isLoading }: TopClientsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-3 w-[80px]" />
              </div>
            </div>
            <Skeleton className="h-4 w-[60px]" />
          </div>
        ))}
      </div>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <AlertCircle className="h-8 w-8 mb-2 text-gray-400" />
        <p>No client data available for this period</p>
      </div>
    );
  }

  return (
    <div className="pt-2">
      <div className="space-y-5">
        {clients.slice(0, 5).map((client) => {
          return (
            <div key={client.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-navy-900 truncate max-w-[120px] sm:max-w-[180px]">
                    {client.name}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {client.count} invoices
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-semibold text-navy-900">
                  {formatCurrency(client.amount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 border-t pt-4 text-center">
        <Link 
          to="/clients" 
          className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
        >
          View all clients
        </Link>
      </div>
    </div>
  );
}
