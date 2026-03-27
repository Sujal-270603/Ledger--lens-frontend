import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDocuments, useDeleteDocument, useReprocessDocument } from '@/hooks/useDocuments';
import type { DocumentProcessingStatus } from '@/types/document.types';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from '@/components/ui/use-toast';

import { DocumentCard } from './DocumentCard';
import { UploadModal } from './UploadModal';
import { ExtractionPreviewDrawer } from './ExtractionPreviewDrawer';
import { documentApi } from '@/api/document.api';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<DocumentProcessingStatus | 'ALL'>('ALL');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(null);
  const [deleteDocumentId, setDeleteDocumentId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filters = {
    page,
    limit: 20,
    ...(activeFilter !== 'ALL' && { processingStatus: activeFilter as DocumentProcessingStatus }),
  };

  const { data, isLoading } = useDocuments(filters);
  const { mutate: deleteDoc, isPending: isDeleting } = useDeleteDocument();
  const { mutate: reprocessDoc } = useReprocessDocument();

  const documents = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  const handleDownload = async (id: string) => {
    try {
      const { downloadUrl } = await documentApi.getDownloadUrl(id);
      window.open(downloadUrl, '_blank');
    } catch {
      toast.error('Failed to generate download URL');
    }
  };

  const handleDelete = () => {
    if (!deleteDocumentId) return;
    deleteDoc(deleteDocumentId, {
      onSuccess: () => {
        toast.success("Document deleted");
        setDeleteDocumentId(null);
      },
      onError: () => toast.error("Failed to delete document")
    });
  };

  const handleReprocess = (id: string) => {
    reprocessDoc(id, {
      onSuccess: () => toast.success("Reprocessing started"),
      onError: () => toast.error("Failed to start reprocessing")
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">Documents</h1>
          <p className="text-muted-foreground mt-1">
            Upload and manage your invoice documents
          </p>
        </div>
        <Button onClick={() => setUploadModalOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b overflow-x-auto scrollbar-hide">
        {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].map((status) => (
          <button
            key={status}
            onClick={() => { setActiveFilter(status as any); setPage(1); }}
            className={cn(
              "px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              activeFilter === status
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
            )}
          >
            {status === 'ALL' ? `All (${activeFilter === 'ALL' ? meta.total : '...'})` : STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description={activeFilter === 'ALL' ? "Upload your first invoice document to get started." : `No documents found with status ${STATUS_LABELS[activeFilter]}`}
          action={activeFilter === 'ALL' ? { label: "Upload Document", onClick: () => setUploadModalOpen(true) } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onViewInvoice={(invoiceId) => navigate(`/invoices/${invoiceId}`)}
              onDownload={handleDownload}
              onReprocess={handleReprocess}
              onDelete={setDeleteDocumentId}
              onViewExtractionPreview={setPreviewDocumentId}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && documents.length > 0 && (
        <Pagination
          page={page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Modals & Drawers */}
      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />

      <ExtractionPreviewDrawer
        documentId={previewDocumentId}
        open={!!previewDocumentId}
        onClose={() => setPreviewDocumentId(null)}
      />

      <ConfirmDialog
        open={!!deleteDocumentId}
        onOpenChange={(open) => !open && setDeleteDocumentId(null)}
        title="Delete Document"
        description="Are you sure you want to permanently delete this document? This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </div>
  );
}
