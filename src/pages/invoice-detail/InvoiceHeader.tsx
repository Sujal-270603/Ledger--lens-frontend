import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import type { InvoiceResponse } from '@/types/invoice.types';
import { ArrowLeft, Edit, FileText, Send, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

interface InvoiceHeaderProps {
  invoice: InvoiceResponse;
  isActionsDisabled: boolean;
  onViewDocument?: () => void;
  onEdit?: () => void;
  onSubmit: () => void;
  onApprove: () => void;
  onReject: () => void;
  onReopen: () => void;
}

export function InvoiceHeader({
  invoice,
  isActionsDisabled,
  onViewDocument,
  onEdit,
  onSubmit,
  onApprove,
  onReject,
  onReopen,
}: InvoiceHeaderProps) {
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();

  return (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        {/* Top bare bone nav */}
        <button
          onClick={() => navigate('/invoices')}
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-navy-900 mb-4 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Invoices
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-navy-900">
                Invoice {invoice.invoiceNumber}
              </h1>
              <StatusBadge status={invoice.status} className="text-sm px-2.5 py-0.5" />
            </div>
            
            <div className="flex items-center gap-4 text-sm text-slate-500">
              {invoice.documentId && (
                <button 
                  onClick={onViewDocument}
                  className="flex items-center hover:text-brand-600 transition-colors"
                >
                  <FileText className="h-4 w-4 mr-1.5" />
                  View Original Document
                </button>
              )}
              {invoice.confidenceScore !== null && (
                <span className="flex items-center gap-1.5" title="AI Extraction Confidence">
                  <span className={`h-2 w-2 rounded-full ${invoice.confidenceScore >= 0.8 ? 'bg-green-500' : 'bg-amber-500'}`} />
                  {Math.round(invoice.confidenceScore * 100)}% Match
                </span>
              )}
            </div>
          </div>

          {/* Workflow Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {invoice.status === 'DRAFT' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onEdit} 
                  disabled={isActionsDisabled || !hasPermission('EDIT_INVOICE')}
                >
                  <Edit className="h-4 w-4 mr-1.5" /> Edit
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={onSubmit} 
                  loading={isActionsDisabled} 
                  disabled={!hasPermission('SUBMIT_INVOICE')}
                >
                  <Send className="h-4 w-4 mr-1.5" /> Submit for Approval
                </Button>
              </>
            )}

            {invoice.status === 'SUBMITTED' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50" 
                  onClick={onReject} 
                  disabled={isActionsDisabled || !hasPermission('APPROVE_INVOICE')}
                >
                  <XCircle className="h-4 w-4 mr-1.5" /> Reject
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700" 
                  onClick={onApprove} 
                  loading={isActionsDisabled} 
                  disabled={!hasPermission('APPROVE_INVOICE')}
                >
                  <CheckCircle className="h-4 w-4 mr-1.5" /> Approve
                </Button>
              </>
            )}

            {(invoice.status === 'APPROVED' || invoice.status === 'REJECTED') && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onReopen} 
                disabled={isActionsDisabled || !hasPermission('REOPEN_INVOICE')}
              >
                <RotateCcw className="h-4 w-4 mr-1.5" /> Reopen Data
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
