import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RotateCcw } from 'lucide-react';

interface ReopenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReopen: (reason: string) => void;
  isPending: boolean;
}

export function ReopenDialog({ open, onOpenChange, onReopen, isPending }: ReopenDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleReopen = () => {
    if (!reason.trim()) {
      setError('A reason is required to reopen an invoice.');
      return;
    }
    setError('');
    onReopen(reason);
  };

  return (
    <Dialog open={open} onOpenChange={isPending ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-navy-900 mb-2">
            <RotateCcw className="h-6 w-6" />
            <DialogTitle>Reopen Invoice Data</DialogTitle>
          </div>
          <DialogDescription>
            Reopening this invoice will unlock it for editing and return it to the DRAFT status. 
            <strong> If approved, associated journal entries will be reversed.</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="text-sm font-medium text-navy-900 mb-2 block">
            Reason for Reopening <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g., Need to correct line items..."
            rows={4}
            error={error}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleReopen}
            loading={isPending}
          >
            Reopen Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
