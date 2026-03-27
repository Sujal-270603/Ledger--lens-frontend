import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { Select } from '@/components/ui/select';
import { useUploadDocument } from '@/hooks/useDocuments';
import { useClients } from '@/hooks/useInvoices';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
}

export function UploadModal({ open, onClose }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [clientId, setClientId] = useState<string>('');
  const { data: clients = [] } = useClients();
  const { upload, progress, step, error, reset } = useUploadDocument();

  // Reset state when modal is opened/closed
  useEffect(() => {
    if (open) {
      setFile(null);
      setClientId('');
      reset();
    }
  }, [open, reset]);

  const handleUploadClick = async () => {
    if (!file) return;
    try {
      await upload(file, clientId || undefined);
    } catch (e) {
      // Error is handled in the hook and shown in the UI
    }
  };

  const clientOptions = clients.map(c => ({ value: c.id, label: c.name }));

  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => {
      // Prevent closing by clicking outside during upload
      if (!isOpen && (step === 'idle' || step === 'done' || step === 'error')) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex items-center gap-2 mb-6 opacity-70">
            <div className={`text-xs font-semibold px-2 py-1 rounded-full ${step === 'idle' || step === 'error' ? 'bg-brand-100 text-brand-700' : 'bg-slate-100'}`}>1. Select File</div>
            <div className="h-px bg-border flex-1" />
            <div className={`text-xs font-semibold px-2 py-1 rounded-full ${step === 'getting-url' || step === 'uploading' || step === 'confirming' ? 'bg-brand-100 text-brand-700' : 'bg-slate-100'}`}>2. Uploading</div>
            <div className="h-px bg-border flex-1" />
            <div className={`text-xs font-semibold px-2 py-1 rounded-full ${step === 'done' ? 'bg-green-100 text-green-700' : 'bg-slate-100'}`}>3. Processing</div>
          </div>

          {(step === 'idle' || step === 'error') && (
            <div className="space-y-4 animate-in fade-in">
              <FileDropzone
                accept={['application/pdf', 'image/jpeg', 'image/png']}
                onFileSelect={setFile}
                maxSizeMb={10}
              />
              
              <div>
                <label className="text-sm font-medium mb-1.5 block">Link to client (optional)</label>
                <Select
                  options={clientOptions}
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Select a client..."
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                  {error}
                </div>
              )}

              <Button
                className="w-full"
                disabled={!file}
                onClick={handleUploadClick}
              >
                Upload Document
              </Button>
            </div>
          )}

          {(step === 'getting-url' || step === 'uploading' || step === 'confirming') && (
            <div className="py-8 space-y-6 animate-in slide-in-from-right-4 fade-in">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-navy-900 mb-1">Uploading...</h3>
                <p className="text-sm text-muted-foreground">{file?.name}</p>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-brand-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-brand-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Preparing secure upload</span>
                </div>
                <div className={`flex items-center gap-3 ${step === 'uploading' || step === 'confirming' ? 'text-brand-700' : 'text-slate-400'}`}>
                  {step === 'uploading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>Uploading file to secure storage... {progress}%</span>
                </div>
                <div className={`flex items-center gap-3 ${step === 'confirming' ? 'text-brand-700' : 'text-slate-400'}`}>
                  {step === 'confirming' ? <Loader2 className="h-4 w-4 animate-spin" /> : <div className="h-4 w-4 rounded-full border-2 border-slate-300" />}
                  <span>Starting AI processing</span>
                </div>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in-95 fade-in">
              <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-navy-900 mb-2">Upload Successful!</h3>
              <p className="text-slate-600 mb-8 max-w-xs">
                AI is now reading your invoice. It usually takes 5-10 seconds to extract the data.
              </p>
              
              <div className="flex items-center justify-center gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={() => reset()}>
                  Upload Another
                </Button>
                <Button variant="default" className="flex-1 bg-green-600 hover:bg-green-700" onClick={onClose}>
                  View in Documents <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
