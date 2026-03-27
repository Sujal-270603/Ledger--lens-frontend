import { FileText, Image as ImageIcon, Download, RefreshCw, Trash2, Eye, AlertTriangle } from 'lucide-react';
import type { DocumentResponse } from '@/types/document.types';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { formatFileSize } from '@/lib/utils';

interface DocumentCardProps {
  document: DocumentResponse;
  onViewInvoice?: (invoiceId: string) => void;
  onDownload?: (documentId: string) => void;
  onReprocess?: (documentId: string) => void;
  onDelete?: (documentId: string) => void;
  onViewExtractionPreview?: (documentId: string) => void;
}

export function DocumentCard({
  document: doc,
  onViewInvoice,
  onDownload,
  onReprocess,
  onDelete,
  onViewExtractionPreview,
}: DocumentCardProps) {
  const isPdf = doc.mimeType === 'application/pdf';

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border bg-white shadow-sm hover:shadow transition-shadow">
      {/* Icon Area */}
      <div className="flex shrink-0 h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {isPdf ? <FileText className="h-6 w-6 text-red-500" /> : <ImageIcon className="h-6 w-6 text-blue-500" />}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-navy-900 truncate">
            {doc.originalName}
          </h4>
          <StatusBadge status={doc.processingStatus} />
          
          {doc.processingStatus === 'COMPLETED' && doc.invoice?.confidenceScore !== undefined && (
            <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              (doc.invoice.confidenceScore || 0) >= 0.75 
                ? 'bg-green-100 text-green-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              {Math.round((doc.invoice.confidenceScore || 0) * 100)}% Match
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {doc.uploadedBy && <span>Uploaded by {doc.uploadedBy}</span>}
          {doc.uploadedBy && <span>•</span>}
          <span>{formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}</span>
          <span>•</span>
          <span>{formatFileSize(doc.size)}</span>
        </div>

        {/* Low Confidence Warning */}
        {doc.processingStatus === 'COMPLETED' && doc.invoice?.isLowConfidence && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-md w-fit">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="font-medium">Low confidence — please review extraction</span>
          </div>
        )}
      </div>

      {/* Actions Area */}
      <div className="flex items-center gap-2 sm:self-center shrink-0 mt-2 sm:mt-0">
        {doc.processingStatus === 'COMPLETED' && (
          <>
            {doc.invoice?.isLowConfidence && onViewExtractionPreview ? (
              <Button size="sm" variant="outline" onClick={() => onViewExtractionPreview(doc.id)} className="border-amber-200 text-amber-700 hover:bg-amber-50">
                <Eye className="h-4 w-4 mr-1.5" />
                Preview Extraction
              </Button>
            ) : (
              <Button size="sm" variant="default" onClick={() => doc.invoice?.id && onViewInvoice?.(doc.invoice.id)}>
                View Invoice <Eye className="h-4 w-4 ml-1.5" />
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => onDownload?.(doc.id)}>
              <Download className="h-4 w-4" />
            </Button>
          </>
        )}
        
        {doc.processingStatus === 'FAILED' && (
          <>
            <Button size="sm" variant="outline" onClick={() => onReprocess?.(doc.id)}>
              <RefreshCw className="h-4 w-4 mr-1.5" /> Reprocess
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onDelete?.(doc.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}

        {(doc.processingStatus === 'PENDING' || doc.processingStatus === 'PROCESSING') && (
          <div className="text-sm font-medium text-brand-600 animate-pulse px-3">
            Processing...
          </div>
        )}
      </div>
    </div>
  );
}
