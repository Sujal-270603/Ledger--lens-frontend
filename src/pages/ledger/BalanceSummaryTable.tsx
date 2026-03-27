import { LedgerBalanceSummary } from '@/types/ledger.types';
import { formatCurrency, cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface BalanceSummaryTableProps {
  summary: LedgerBalanceSummary[];
  isLoading?: boolean;
}

export function BalanceSummaryTable({ summary, isLoading }: BalanceSummaryTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  const totals = summary.reduce(
    (acc, item) => ({
      debit: acc.debit + parseFloat(item.totalDebit),
      credit: acc.credit + parseFloat(item.totalCredit),
    }),
    { debit: 0, credit: 0 }
  );

  const isBalanced = Math.abs(totals.debit - totals.credit) < 0.01;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-slate-500 font-medium border-b bg-slate-50/50">
          <tr>
            <th className="py-3 px-4">Ledger Account</th>
            <th className="py-3 px-4 text-right">Total Debit</th>
            <th className="py-3 px-4 text-right">Total Credit</th>
            <th className="py-3 px-4 text-right">Net Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {summary.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-8 text-center text-muted-foreground">
                No ledger activity yet
              </td>
            </tr>
          ) : (
            summary.map((item) => {
              const net = parseFloat(item.netBalance);
              return (
                <tr key={item.ledgerId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">{item.ledgerName}</td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    {formatCurrency(item.totalDebit)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    {formatCurrency(item.totalCredit)}
                  </td>
                  <td className={cn(
                    "py-3 px-4 text-right font-medium",
                    net > 0 && "text-green-600",
                    net < 0 && "text-red-600",
                    net === 0 && "text-slate-400"
                  )}>
                    {formatCurrency(item.netBalance)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
        <tfoot className="bg-slate-50/50 font-semibold border-t">
          <tr>
            <td className="py-4 px-4 text-slate-900">Total</td>
            <td className="py-4 px-4 text-right text-slate-900">{formatCurrency(totals.debit)}</td>
            <td className="py-4 px-4 text-right text-slate-900">{formatCurrency(totals.credit)}</td>
            <td className="py-4 px-4 text-right">
              <div className="flex flex-col items-end">
                <span className={isBalanced ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(totals.debit - totals.credit)}
                </span>
                <div className={cn(
                  "flex items-center gap-1.5 text-[10px] uppercase tracking-wider mt-1",
                  isBalanced ? "text-green-600" : "text-red-600"
                )}>
                  {isBalanced ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Balanced
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3 w-3" />
                      Unbalanced
                    </>
                  )}
                </div>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
