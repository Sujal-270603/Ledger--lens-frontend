import { useInvoiceHistory } from '@/hooks/useInvoices';
import { formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, CheckCircle2, XCircle, Send, PlusCircle, RotateCcw } from 'lucide-react';

interface InvoiceTimelineProps {
  invoiceId: string;
}

export function InvoiceTimeline({ invoiceId }: InvoiceTimelineProps) {
  const { data: history, isLoading } = useInvoiceHistory(invoiceId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No history available for this invoice.
        </CardContent>
      </Card>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATED': return <PlusCircle className="h-4 w-4 text-blue-500" />;
      case 'SUBMITTED': return <Send className="h-4 w-4 text-amber-500" />;
      case 'APPROVED': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'REJECTED': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'REOPENED': return <RotateCcw className="h-4 w-4 text-slate-500" />;
      default: return <CheckCircle2 className="h-4 w-4 text-slate-400" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATED': return 'bg-blue-100 border-blue-200';
      case 'SUBMITTED': return 'bg-amber-100 border-amber-200';
      case 'APPROVED': return 'bg-green-100 border-green-200';
      case 'REJECTED': return 'bg-red-100 border-red-200';
      case 'REOPENED': return 'bg-slate-100 border-slate-200';
      default: return 'bg-slate-100 border-slate-200';
    }
  };

  const formatActionName = (action: string) => {
    return action.charAt(0) + action.slice(1).toLowerCase();
  };

  return (
    <Card>
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-lg">Approval Timeline</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {history.map((entry, index) => (
            <div key={index} className="relative flex gap-4">
              {/* Timeline Line */}
              {index !== history.length - 1 && (
                <div className="absolute left-4 top-10 bottom-[-24px] w-px bg-slate-200" />
              )}
              
              {/* Icon */}
              <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${getActionColor(entry.action)}`}>
                {getActionIcon(entry.action)}
              </div>
              
              {/* Content */}
              <div className="flex flex-col flex-1 pb-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-navy-900 text-sm">
                    {formatActionName(entry.action)}
                  </p>
                  <span className="text-xs text-slate-400">
                    {formatDate(entry.createdAt)}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-600">
                  <User className="h-3 w-3" />
                  <span>
                    {entry.performedBy ? entry.performedBy.fullName : 'System'}
                  </span>
                </div>

                {!!entry.details?.reason && (
                  <div className="mt-2 p-2.5 bg-slate-50 border rounded-md text-sm text-slate-700 italic">
                    "{String(entry.details.reason)}"
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
