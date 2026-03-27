import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '@/api/document.api';
import type { DocumentListFilters, DocumentResponse } from '@/types/document.types';

export function useDocuments(filters: DocumentListFilters) {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: () => documentApi.listDocuments(filters),
    staleTime: 30 * 1000,
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => documentApi.getDocument(id),
    enabled: !!id,
  });
}

export function useAIStatus(id: string, enabled: boolean) {
  return useQuery({
    queryKey: ['ai-status', id],
    queryFn: () => documentApi.getAIStatus(id),
    enabled: enabled && !!id,
    refetchInterval: (query) => {
      const data = query.state?.data;
      if (!data) return 5000;
      const status = data.processingStatus;
      if (status === 'PENDING' || status === 'PROCESSING') return 5000;
      return false;
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<'idle' | 'getting-url' | 'uploading' | 'confirming' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsPending(false);
    setProgress(0);
    setStep('idle');
    setError(null);
  }, []);

  const upload = useCallback(async (file: File, clientId?: string): Promise<DocumentResponse> => {
    let documentId: string | null = null;
    try {
      setIsPending(true);
      setError(null);
      setProgress(0);
      
      // Step 1: Get upload URL and create document record
      setStep('getting-url');
      const uploadUrlInfo = await documentApi.getUploadUrl({
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        clientId,
      });
      documentId = uploadUrlInfo.documentId;

      // Step 2: Upload to S3
      setStep('uploading');
      await documentApi.uploadToS3(uploadUrlInfo.uploadUrl, file, setProgress);

      // Step 3: Confirm upload and trigger processing
      setStep('confirming');
      const confirmedDoc = await documentApi.confirmUpload(uploadUrlInfo.documentId);

      setStep('done');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      
      return confirmedDoc;
    } catch (err: any) {
      setStep('error');
      setError(err.message || 'An error occurred during upload');
      
      // Cleanup: If a document record was created but upload/confirm failed, delete it
      if (documentId) {
        try {
          await documentApi.deleteDocument(documentId);
        } catch (cleanupErr) {
          console.error('Failed to cleanup document after failed upload:', cleanupErr);
        }
      }
      
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [queryClient]);

  return { upload, isPending, progress, step, error, reset };
}

export function useReprocessDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentApi.reprocessDocument,
    onSuccess: (_, documentId) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['ai-status', documentId] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentApi.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useAcceptExtraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, overrides }: { id: string; overrides?: Record<string, unknown> }) => 
      documentApi.acceptExtraction(id, overrides),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}
