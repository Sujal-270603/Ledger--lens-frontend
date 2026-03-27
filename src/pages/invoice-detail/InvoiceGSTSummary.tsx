import type { InvoiceResponse } from '@/types/invoice.types';
import { formatCurrency } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface InvoiceGSTSummaryProps {
  invoice: InvoiceResponse;
}

export function InvoiceGSTSummary({ invoice }: InvoiceGSTSummaryProps) {
  const subtotal = Number(invoice.totalAmount) - Number(invoice.gstAmount);

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Tax & Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 font-medium text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal (Taxable)</span>
            <span className="tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
          
          <div className="pt-2 border-t border-slate-100 space-y-2">
            {invoice.cgstAmount && Number(invoice.cgstAmount) > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>CGST</span>
                <span className="tabular-nums font-mono">{formatCurrency(invoice.cgstAmount)}</span>
              </div>
            )}
            {invoice.sgstAmount && Number(invoice.sgstAmount) > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>SGST / UTGST</span>
                <span className="tabular-nums font-mono">{formatCurrency(invoice.sgstAmount)}</span>
              </div>
            )}
            {invoice.igstAmount && Number(invoice.igstAmount) > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>IGST</span>
                <span className="tabular-nums font-mono">{formatCurrency(invoice.igstAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-navy-900 font-semibold pt-1">
              <span>Total GST</span>
              <span className="tabular-nums">{formatCurrency(invoice.gstAmount)}</span>
            </div>
          </div>
          
          <div className="pt-4 mt-2 border-t-2 border-slate-200">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg text-navy-900">Grand Total</span>
              <span className="text-2xl font-bold tracking-tight text-brand-600 tabular-nums">
                {formatCurrency(invoice.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
