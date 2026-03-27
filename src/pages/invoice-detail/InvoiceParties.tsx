import { Building2, Calendar, FileDigit } from 'lucide-react';
import type { InvoiceResponse } from '@/types/invoice.types';
import { formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface InvoicePartiesProps {
  invoice: InvoiceResponse;
}

export function InvoiceParties({ invoice }: InvoicePartiesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Client Summary */}
      <Card>
        <CardContent className="p-5 flex gap-4">
          <div className="h-10 w-10 shrink-0 bg-brand-50 rounded-lg flex items-center justify-center border border-brand-100 mt-1">
            <Building2 className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-1">Billed To</p>
            {invoice.client ? (
              <>
                <p className="font-semibold text-navy-900 text-lg mb-1">{invoice.client.name}</p>
                {invoice.client.gstin ? (
                  <p className="text-sm font-medium text-slate-600 font-mono bg-slate-100 flex items-center gap-1.5 px-2 py-0.5 rounded w-fit">
                    GSTIN: {invoice.client.gstin}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic">No GSTIN recorded</p>
                )}
              </>
            ) : (
              <p className="text-amber-600 font-medium italic mt-2">No client linked to this invoice</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Summary */}
      <Card>
        <CardContent className="p-5 grid grid-cols-2 gap-y-4 gap-x-2">
          <DetailBlock icon={FileDigit} label="Invoice Number" value={invoice.invoiceNumber} />
          <DetailBlock icon={Calendar} label="Date Issued" value={formatDate(invoice.invoiceDate)} />
          <DetailBlock 
            icon={Calendar} 
            label="Created On" 
            value={formatDate(invoice.createdAt)} 
            light 
          />
        </CardContent>
      </Card>
    </div>
  );
}

function DetailBlock({ 
  icon: Icon, 
  label, 
  value, 
  light 
}: { 
  icon: any; 
  label: string; 
  value: string;
  light?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-1 flex items-center gap-1">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className={`font-medium ${light ? 'text-slate-600' : 'text-navy-900'}`}>{value}</p>
    </div>
  );
}
