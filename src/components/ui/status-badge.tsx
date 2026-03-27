import { Badge } from '@/components/ui/badge';
import type { InvoiceStatus } from '@/types/invoice.types';
import type { DocumentProcessingStatus } from '@/types/document.types';
import { Loader2 } from 'lucide-react';

interface StatusBadgeProps {
  status: InvoiceStatus | DocumentProcessingStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    // Invoice Statuses
    case 'DRAFT':
    case 'PENDING': // Document Processing Status
      return (
        <Badge variant="ghost" className={className}>
          {status === 'DRAFT' ? 'Draft' : 'Pending'}
        </Badge>
      );
    case 'SUBMITTED':
      return (
        <Badge variant="warning" className={className}>
          Pending Approval
        </Badge>
      );
    case 'APPROVED':
    case 'COMPLETED': // Document Processing Status
      return (
        <Badge variant="success" className={className}>
          {status === 'APPROVED' ? 'Approved' : 'Completed'}
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge variant="error" className={className}>
          Rejected
        </Badge>
      );
    case 'FAILED':
      return (
        <Badge variant="error" className={className}>
          Failed
        </Badge>
      );
    case 'PROCESSING': // Document Processing Status
      return (
        <Badge variant="info" className={`gap-1 pr-3 ${className || ''}`}>
          <Loader2 className="h-3 w-3 animate-spin" />
          Processing
        </Badge>
      );
    default:
      return <Badge variant="default" className={className}>{status}</Badge>;
  }
}
