import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { documentApi } from '@/api/document.api';
import { useAcceptExtraction } from '@/hooks/useDocuments';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ExtractionPreviewDrawerProps {
  documentId: string | null;
  open: boolean;
  onClose: () => void;
}

export function ExtractionPreviewDrawer({ documentId, open, onClose }: ExtractionPreviewDrawerProps) {
  const navigate = useNavigate();
  
  const { data: preview, isLoading } = useQuery({
    queryKey: ['extraction-preview', documentId],
    queryFn: () => documentApi.getExtractionPreview(documentId!),
    enabled: open && !!documentId,
  });

  const { mutate: acceptExtraction, isPending: isAccepting } = useAcceptExtraction();

  const handleAccept = () => {
    if (!documentId) return;
    acceptExtraction(
      { id: documentId },
      {
        onSuccess: (data) => {
          onClose();
          navigate(`/invoices/${data.id}`);
        },
      }
    );
  };

  const handleReviewManually = () => {
    if (!preview?.invoiceId) return;
    onClose();
    navigate(`/invoices/${preview.invoiceId}`);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
      {/* Drawer Style styling via DialogContent overrides */}
      <DialogContent className="fixed right-0 top-0 bottom-0 h-full w-full sm:max-w-md m-0 translate-x-0 translate-y-0 rounded-none rounded-l-xl flex flex-col overflow-hidden data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle>AI Extraction Preview</DialogTitle>
          <DialogDescription>Review the extracted data before submitting.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
              <p className="text-sm text-muted-foreground">Loading preview data...</p>
            </div>
          ) : preview ? (
            <div className="space-y-6">
              
              {/* Score card */}
              <div className="p-4 rounded-xl border bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">AI Confidence</p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-navy-900">{Math.round(preview.confidenceScore * 100)}%</span>
                  </div>
                </div>
                <div className={`h-12 w-1.5 rounded-full ${preview.isLowConfidence ? 'bg-amber-400' : 'bg-green-500'}`} />
              </div>

              {preview.extractionNotes && (
                <div className="flex gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <p>{preview.extractionNotes}</p>
                </div>
              )}

              {/* Core Fields */}
              <div>
                <h4 className="font-semibold text-navy-900 mb-3 border-b pb-2">Extracted Fields</h4>
                <div className="space-y-3">
                  <FieldRow label="Invoice Number" value={preview.rawExtraction.invoiceNumber} />
                  <FieldRow label="Invoice Date" value={preview.rawExtraction.invoiceDate} />
                  <FieldRow label="Vendor Name" value={preview.rawExtraction.vendorName} />
                  <FieldRow label="Vendor GSTIN" value={preview.rawExtraction.vendorGstin} />
                </div>
              </div>

              {/* Amount Fields */}
              <div>
                <h4 className="font-semibold text-navy-900 mb-3 border-b pb-2">Amounts</h4>
                <div className="space-y-3">
                  <FieldRow label="Total Amount" value={preview.rawExtraction.totalAmount ? formatCurrency(preview.rawExtraction.totalAmount) : null} bold />
                  <FieldRow label="Total GST" value={preview.rawExtraction.gstAmount ? formatCurrency(preview.rawExtraction.gstAmount) : null} />
                  {preview.rawExtraction.cgstAmount !== null && <FieldRow label="CGST" value={formatCurrency(preview.rawExtraction.cgstAmount)} />}
                  {preview.rawExtraction.sgstAmount !== null && <FieldRow label="SGST" value={formatCurrency(preview.rawExtraction.sgstAmount)} />}
                  {preview.rawExtraction.igstAmount !== null && <FieldRow label="IGST" value={formatCurrency(preview.rawExtraction.igstAmount)} />}
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h4 className="font-semibold text-navy-900 mb-3 border-b pb-2">Line Items ({preview.rawExtraction.items.length})</h4>
                <div className="space-y-4">
                  {preview.rawExtraction.items.map((item, i) => (
                    <div key={i} className="text-sm border rounded-lg p-3 bg-white">
                      <p className="font-medium text-navy-900 mb-2 truncate" title={item.description}>{item.description}</p>
                      <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-xs text-slate-500">
                        <div className="flex justify-between"><span>Qty:</span> <span className="text-slate-900 font-medium">{item.quantity}</span></div>
                        <div className="flex justify-between"><span>Price:</span> <span className="text-slate-900 font-medium">{formatCurrency(item.unitPrice)}</span></div>
                        <div className="flex justify-between"><span>HSN:</span> <span className="text-slate-900 font-medium">{item.hsnCode || '—'}</span></div>
                        <div className="flex justify-between"><span>Tax Rate:</span> <span className="text-slate-900 font-medium">{item.taxRate}%</span></div>
                      </div>
                      <div className="mt-2 pt-2 border-t flex justify-between font-semibold">
                        <span>Amount</span>
                        <span className="text-navy-900">{formatCurrency(item.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              Failed to load preview.
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-slate-50 shrink-0 flex gap-3 flex-col sm:flex-row">
          <Button variant="outline" className="flex-1" onClick={handleReviewManually}>
            Review Manually
          </Button>
          <Button 
            className="flex-1 bg-brand-600 hover:bg-brand-700" 
            onClick={handleAccept}
            loading={isAccepting}
            disabled={!preview || isLoading}
          >
            Accept & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FieldRow({ label, value, bold }: { label: string; value: string | null; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      {value ? (
        <span className={`text-navy-900 ${bold ? 'font-bold' : 'font-medium'}`}>{value}</span>
      ) : (
        <span className="text-slate-300 italic">Not detected</span>
      )}
    </div>
  );
}
