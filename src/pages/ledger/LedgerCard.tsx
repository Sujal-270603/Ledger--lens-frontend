import { LedgerListItem } from '@/types/ledger.types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, BookOpen } from 'lucide-react';

interface LedgerCardProps {
  ledger: LedgerListItem;
  onEdit: () => void;
  onDelete: () => void;
}

const DEFAULT_LEDGERS = [
  'Sales', 'Purchase', 'Cash', 'Bank', 'Accounts Receivable', 'Accounts Payable',
  'CGST Output', 'SGST Output', 'IGST Output', 'CGST Input', 'SGST Input', 'IGST Input'
];

export function LedgerCard({ ledger, onEdit, onDelete }: LedgerCardProps) {
  const isDefault = DEFAULT_LEDGERS.includes(ledger.name);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold text-navy-900 line-clamp-1">
            {ledger.name}
          </CardTitle>
          {isDefault && (
            <span className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
              Default
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          {!isDefault && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-xs text-muted-foreground gap-1.5 mt-1">
          <BookOpen className="h-3.5 w-3.5" />
          <span>{ledger._count.journalLines} journal lines</span>
        </div>
      </CardContent>
    </Card>
  );
}
