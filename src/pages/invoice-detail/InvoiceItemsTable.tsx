import type { InvoiceItemResponse } from '@/types/invoice.types';
import { formatCurrency } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface InvoiceItemsTableProps {
  items: InvoiceItemResponse[];
}

export function InvoiceItemsTable({ items }: InvoiceItemsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-lg">Line Items</CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b">
            <tr>
              <th className="px-6 py-3 w-12 text-center">#</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">HSN Status</th>
              <th className="px-6 py-3 text-right">Quantity</th>
              <th className="px-6 py-3 text-right">Unit Price</th>
              <th className="px-6 py-3 text-right">Tax Rate</th>
              <th className="px-6 py-3 text-right font-semibold text-slate-700">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 text-center text-slate-400 font-medium">{index + 1}</td>
                <td className="px-6 py-4">
                  <p className="font-medium text-navy-900 line-clamp-2" title={item.description}>
                    {item.description}
                  </p>
                </td>
                <td className="px-6 py-4">
                  {item.hsnCode ? (
                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                      {item.hsnCode}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">None</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right tabular-nums text-slate-700">
                  {Number(item.quantity).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right tabular-nums text-slate-700">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="px-6 py-4 text-right tabular-nums">
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold">
                    {Number(item.taxRate)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-right tabular-nums font-semibold text-navy-900">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground italic">
                  No line items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
