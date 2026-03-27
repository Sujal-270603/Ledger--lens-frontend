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
import { XCircle } from 'lucide-react';

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: (reason: string) => void;
  isPending: boolean;
}

export function RejectDialog({ open, onOpenChange, onReject, isPending }: RejectDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleReject = () => {
    if (!reason.trim()) {
      setError('Rejection reason is required.');
      return;
    }
    setError('');
    onReject(reason);
  };

  return (
    <Dialog open={open} onOpenChange={isPending ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <XCircle className="h-6 w-6" />
            <DialogTitle>Reject Invoice</DialogTitle>
          </div>
          <DialogDescription>
            You are about to reject this invoice. Please provide a reason for the rejection to notify the team.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="text-sm font-medium text-navy-900 mb-2 block">
            Reason for Rejection <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g., GSTIN is mismatched or total amount is incorrect..."
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
            variant="destructive"
            onClick={handleReject}
            loading={isPending}
          >
            Confirm Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
