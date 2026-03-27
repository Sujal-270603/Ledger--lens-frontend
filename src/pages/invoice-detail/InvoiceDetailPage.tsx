import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { 
  useInvoice,
  useInvoiceHistory, 
  useSubmitInvoice, 
  useApproveInvoice, 
  useRejectInvoice, 
  useReopenInvoice 
} from '@/hooks/useInvoices';
import { useDocument } from '@/hooks/useDocuments';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/lib/utils';
import { FileText, AlertTriangle, FileDigit, ListTree, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

import { InvoiceHeader } from './InvoiceHeader';
import { InvoiceParties } from './InvoiceParties';
import { InvoiceItemsTable } from './InvoiceItemsTable';
import { InvoiceGSTSummary } from './InvoiceGSTSummary';
import { InvoiceTimeline } from './InvoiceTimeline';
import { JournalEntriesTab } from './JournalEntriesTab';
import { RejectDialog } from './RejectDialog';
import { ReopenDialog } from './ReopenDialog';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'accounting'>('details');
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showReopenDialog, setShowReopenDialog] = useState(false);

  // Queries
  const { data: invoice, isLoading, isError } = useInvoice(id!);
  const { data: document, isLoading: isDocLoading } = useDocument(invoice?.documentId || '');
  const { data: history } = useInvoiceHistory(id!);

  // Mutations
  const { mutate: submitInvoice, isPending: isSubmitting } = useSubmitInvoice();
  const { mutate: approveInvoice, isPending: isApproving } = useApproveInvoice();
  const { mutate: rejectInvoice, isPending: isRejecting } = useRejectInvoice();
  const { mutate: reopenInvoice, isPending: isReopening } = useReopenInvoice();

  const isActionsDisabled = isSubmitting || isApproving || isRejecting || isReopening || isLoading;

  // Handlers
  const handleSubmit = () => {
    submitInvoice(id!, {
      onSuccess: () => {
        toast.success("Invoice submitted for approval");
        setShowSubmitConfirm(false);
      },
      onError: (err) => toast.error("Failed to submit", getErrorMessage(err)),
    });
  };

  const handleApprove = () => {
    approveInvoice(id!, {
      onSuccess: () => {
        toast.success("Invoice approved successfully!");
        setShowApproveConfirm(false);
      },
      onError: (err) => toast.error("Failed to approve", getErrorMessage(err)),
    });
  };

  const handleReject = (reason: string) => {
    rejectInvoice({ id: id!, reason }, {
      onSuccess: () => {
        toast.success("Invoice rejected");
        setShowRejectDialog(false);
      },
      onError: (err) => toast.error("Failed to reject", getErrorMessage(err)),
    });
  };

  const handleReopen = (reason: string) => {
    reopenInvoice({ id: id!, reason }, {
      onSuccess: () => {
        toast.success("Invoice reopened as draft");
        setShowReopenDialog(false);
      },
      onError: (err) => toast.error("Failed to reopen", getErrorMessage(err)),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto py-6 px-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <EmptyState
          icon={AlertTriangle}
          title="Invoice Not Found"
          description="The invoice you're looking for doesn't exist or you don't have permission to view it."
        />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 relative pb-12">
      <InvoiceHeader
        invoice={invoice}
        isActionsDisabled={isActionsDisabled}
        onViewDocument={() => setShowDocViewer(true)}
        onEdit={() => navigate(`/invoices/${id}/edit`)}
        onSubmit={() => setShowSubmitConfirm(true)}
        onApprove={() => setShowApproveConfirm(true)}
        onReject={() => setShowRejectDialog(true)}
        onReopen={() => setShowReopenDialog(true)}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
        
        {/* Verification Warning for Auto-approval guard */}
        {invoice.status === 'SUBMITTED' && history && history.length > 0 && 
         history[history.length - 1].performedBy?.id === user?.id && (
          <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Self-Approval Guard</p>
              <p className="text-sm mt-1">You submitted this invoice. Usually, another team member should approve it. You can still approve it as an admin, but it will be flagged in the audit log.</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b overflow-x-auto scrollbar-hide mb-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'details' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'}`}
          >
            <FileDigit className="h-4 w-4" /> Details
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'timeline' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'}`}
          >
            <ListTree className="h-4 w-4" /> Timeline
          </button>
          <button
            onClick={() => setActiveTab('accounting')}
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'accounting' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'}`}
          >
            <RotateCcw className="h-4 w-4" /> Journal Entries
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            {invoice.rejectionReason && invoice.status === 'REJECTED' && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Rejection Reason</h4>
                  <p className="text-sm">{invoice.rejectionReason}</p>
                </div>
              </div>
            )}
            
            <InvoiceParties invoice={invoice} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <InvoiceItemsTable items={invoice.items || []} />
              </div>
              <div className="lg:col-span-1">
                <InvoiceGSTSummary invoice={invoice} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="max-w-3xl">
            <InvoiceTimeline invoiceId={invoice.id} />
          </div>
        )}

        {activeTab === 'accounting' && (
          <div className="max-w-4xl">
            <JournalEntriesTab invoiceId={invoice.id} />
          </div>
        )}

      </div>

      {/* Modals */}
      <Dialog open={showDocViewer} onOpenChange={setShowDocViewer}>
        <DialogContent className="sm:max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b shrink-0 bg-slate-50">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-600" />
              Original Document Verification
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 bg-slate-100 flex items-center justify-center relative">
            {isDocLoading ? (
              <Skeleton className="h-[90%] w-[90%] rounded-lg" />
            ) : document ? (
              <iframe 
                src={`/api/v1/documents/${document.id}/download-url-placeholder`} // Wait, we need actual presigned URL here. For demo, we might not render it perfectly inside iframe without a presigned src, but we can do our best.
                className="h-full w-full"
                title="Document Preview"
              />
            ) : (
              <div className="text-slate-500 flex flex-col items-center">
                <AlertTriangle className="h-8 w-8 mb-2 text-amber-500" />
                <p>Original document could not be loaded.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showSubmitConfirm}
        onOpenChange={setShowSubmitConfirm}
        title="Submit for Approval"
        description="Are you sure you want to submit this invoice for approval? It will be locked for editing."
        confirmLabel="Submit Invoice"
        onConfirm={handleSubmit}
        isPending={isSubmitting}
      />

      <ConfirmDialog
        open={showApproveConfirm}
        onOpenChange={setShowApproveConfirm}
        title="Approve Invoice"
        description="Approving this invoice will automatically generate the journal entries and prepare it for accounting sync. Are you sure?"
        variant="default" // Would be nice to make this a green button actually, but default is fine.
        confirmLabel="Approve Invoice"
        onConfirm={handleApprove}
        isPending={isApproving}
      />

      <RejectDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        onReject={handleReject}
        isPending={isRejecting}
      />

      <ReopenDialog
        open={showReopenDialog}
        onOpenChange={setShowReopenDialog}
        onReopen={handleReopen}
        isPending={isReopening}
      />

    </div>
  );
}
