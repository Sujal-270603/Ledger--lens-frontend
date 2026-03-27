import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Info } from 'lucide-react';
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
import { useCreateLedger, useUpdateLedger } from '@/hooks/useLedger';
import { LedgerListItem } from '@/types/ledger.types';

const ledgerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
});

type LedgerFormData = z.infer<typeof ledgerSchema>;

interface LedgerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  ledger?: LedgerListItem;
  onSuccess: () => void;
}

export function LedgerFormModal({ open, onOpenChange, clientId, ledger, onSuccess }: LedgerFormModalProps) {
  const createMut = useCreateLedger(clientId);
  const updateMut = useUpdateLedger(clientId);
  const isEditMode = !!ledger;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LedgerFormData>({
    resolver: zodResolver(ledgerSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (open) {
      reset({ name: ledger?.name || '' });
    }
  }, [open, ledger, reset]);

  const onSubmit = async (data: LedgerFormData) => {
    try {
      if (isEditMode && ledger) {
        await updateMut.mutateAsync({ id: ledger.id, name: data.name });
      } else {
        await createMut.mutateAsync(data);
      }
      onSuccess();
    } catch (error: any) {
      // Error handling is managed in the hook (toast + 409 check)
    }
  };

  const isPending = isSubmitting || createMut.isPending || updateMut.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Ledger Account' : 'Add Ledger Account'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Rename this ledger account' : 'Add a custom ledger account to your chart of accounts'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" required>Account Name</Label>
            <Input
              id="name"
              placeholder="e.g. TDS Receivable"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          {!isEditMode && (
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex gap-3 text-sm text-blue-700">
              <Info className="h-5 w-5 shrink-0 text-blue-500" />
              <p>
                12 default accounts are created automatically for every organization: Purchase, Sales, GST accounts, Payables/Receivables, Bank, and Cash.
              </p>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              {isEditMode ? 'Save Changes' : 'Save Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
