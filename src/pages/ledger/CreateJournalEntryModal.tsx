import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateJournalEntry, useLedgerList } from '@/hooks/useLedger';
import { useApprovedInvoices } from '@/hooks/useInvoices';
import { formatCurrency, cn } from '@/lib/utils';

const lineSchema = z.object({
  ledgerId: z.string().min(1, 'Required'),
  debit:    z.coerce.number().min(0).default(0),
  credit:   z.coerce.number().min(0).default(0),
}).refine(data => (data.debit || 0) > 0 || (data.credit || 0) > 0, {
  message: "Either debit or credit must be greater than 0",
  path: ['debit']
});

const entrySchema = z.object({
  invoiceId:   z.string().min(1, 'Reference invoice is required'),
  entryDate:   z.string().min(1, 'Date is required'),
  description: z.string().optional().default(''),
  lines:       z.array(lineSchema).min(2, 'At least 2 lines required'),
}).refine(data => {
  const totalDebit = data.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
  const totalCredit = data.lines.reduce((sum, l) => sum + (l.credit || 0), 0);
  return Math.abs(totalDebit - totalCredit) < 0.01;
}, {
  message: "Total Debits must equal Total Credits",
  path: ['lines']
});

type EntryFormData = z.infer<typeof entrySchema>;

interface CreateJournalEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  onSuccess: () => void;
}

export function CreateJournalEntryModal({ open, onOpenChange, clientId, onSuccess }: CreateJournalEntryModalProps) {
  const createMut = useCreateJournalEntry(clientId);
  const { data: ledgersData } = useLedgerList(clientId, { limit: 100 });
  const { data: invoices } = useApprovedInvoices(clientId);

  const ledgerOptions = (ledgersData?.data || []).map(l => ({ value: l.id, label: l.name }));
  const invoiceOptions = (invoices || []).map(i => ({ value: i.id, label: `${i.invoiceNumber} (${formatCurrency(i.totalAmount)})` }));

  const { register, control, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema) as any,
    defaultValues: {
      invoiceId: '',
      description: '',
      entryDate: new Date().toISOString().split('T')[0],
      lines: [{ ledgerId: '', debit: 0, credit: 0 }, { ledgerId: '', debit: 0, credit: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const watchLines = watch("lines");

  const totals = watchLines?.reduce((acc, line: any) => ({
    debit: acc.debit + (Number(line.debit) || 0),
    credit: acc.credit + (Number(line.credit) || 0)
  }), { debit: 0, credit: 0 }) || { debit: 0, credit: 0 };

  const isBalanced = Math.abs(totals.debit - totals.credit) < 0.01 && totals.debit > 0;

  useEffect(() => {
    if (open) reset({
      invoiceId: '',
      description: '',
      entryDate: new Date().toISOString().split('T')[0],
      lines: [{ ledgerId: '', debit: 0, credit: 0 }, { ledgerId: '', debit: 0, credit: 0 }]
    });
  }, [open, reset]);

  const onSubmit = async (data: EntryFormData) => {
    try {
      await createMut.mutateAsync(data);
      onSuccess();
    } catch (error) {
      // Handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Journal Entry</DialogTitle>
          <DialogDescription>
            Record a manual accounting entry. Debits and Credits must balance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label required>Reference Invoice</Label>
              <Select 
                options={invoiceOptions} 
                placeholder="Select invoice..." 
                error={errors.invoiceId?.message}
                {...register('invoiceId')}
              />
            </div>
            <div className="space-y-2">
              <Label required>Entry Date</Label>
              <Input type="date" error={errors.entryDate?.message} {...register('entryDate')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              placeholder="e.g. Manual adjustment for TDS..." 
              error={errors.description?.message}
              {...register('description')}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Entry Lines</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ ledgerId: '', debit: 0, credit: 0 })}>
                <Plus className="h-4 w-4 mr-1.5" /> Add Line
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-top-1">
                  <div className="flex-[2]">
                    <Select 
                      options={ledgerOptions} 
                      placeholder="Account..." 
                      error={errors.lines?.[index]?.ledgerId?.message}
                      {...register(`lines.${index}.ledgerId`)}
                    />
                  </div>
                  <div className="flex-1">
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="Debit" 
                      error={errors.lines?.[index]?.debit?.message}
                      {...register(`lines.${index}.debit`)} 
                    />
                  </div>
                  <div className="flex-1">
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="Credit" 
                      error={errors.lines?.[index]?.credit?.message}
                      {...register(`lines.${index}.credit`)} 
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 text-destructive shrink-0"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 2}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            {errors.lines && (errors.lines as any).root && (
              <p className="text-sm text-destructive flex items-center gap-1.5 mt-1">
                <AlertCircle className="h-4 w-4" /> {(errors.lines as any).root.message}
              </p>
            )}
          </div>

          {/* Totals Summary */}
          <div className="bg-slate-50 border rounded-xl p-4 flex items-center justify-between">
            <div className="flex gap-8">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Debit</div>
                <div className="text-lg font-bold text-slate-900">{formatCurrency(totals.debit)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Credit</div>
                <div className="text-lg font-bold text-slate-900">{formatCurrency(totals.credit)}</div>
              </div>
            </div>
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors",
              isBalanced ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
            )}>
              {isBalanced ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Balanced
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" /> Out of Balance by {formatCurrency(Math.abs(totals.debit - totals.credit))}
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isBalanced || isSubmitting} loading={isSubmitting}>
              Post Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
