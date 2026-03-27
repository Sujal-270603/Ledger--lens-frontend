import api from './axios';
import type {
  DocumentResponse,
  UploadUrlResponse,
  AIStatusResponse,
  ExtractionPreviewResponse,
  DocumentListFilters,
} from '@/types/document.types';
import type { InvoiceResponse } from '@/types/invoice.types';

export const documentApi = {
  getUploadUrl: async (data: {
    originalName: string;
    mimeType:     string;
    size:         number;
    clientId?:    string;
  }): Promise<UploadUrlResponse> => {
    const res = await api.post<{ status: string; data: UploadUrlResponse }>('/documents/upload-url', data);
    return res.data.data;
  },

  uploadToS3: async (
    uploadUrl: string,
    file: File,
    onProgress: (percent: number) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
      
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };
      
      xhr.onerror = () => reject(new Error('Upload failed network error'));
      xhr.send(file);
    });
  },

  confirmUpload: async (documentId: string): Promise<DocumentResponse> => {
    const res = await api.post<{ status: string; data: DocumentResponse }>(`/documents/${documentId}/confirm`);
    return res.data.data;
  },

  listDocuments: async (filters: DocumentListFilters): Promise<{
    data: DocumentResponse[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.processingStatus) params.append('processingStatus', filters.processingStatus);

    const res = await api.get<{ data: DocumentResponse[]; meta: any }>(`/documents?${params.toString()}`);
    return res.data;
  },

  getDocument: async (id: string): Promise<DocumentResponse> => {
    const res = await api.get<{ status: string; data: DocumentResponse }>(`/documents/${id}`);
    return res.data.data;
  },

  getAIStatus: async (id: string): Promise<AIStatusResponse> => {
    const res = await api.get<{ status: string; data: AIStatusResponse }>(`/documents/${id}/ai-status`);
    return res.data.data;
  },

  getDownloadUrl: async (id: string): Promise<{ downloadUrl: string; expiresInSeconds: number }> => {
    const res = await api.get<{ status: string; data: { downloadUrl: string; expiresInSeconds: number } }>(`/documents/${id}/download`);
    return res.data.data;
  },

  getExtractionPreview: async (id: string): Promise<ExtractionPreviewResponse> => {
    const res = await api.get<{ status: string; data: ExtractionPreviewResponse }>(`/documents/${id}/extraction-preview`);
    return res.data.data;
  },

  acceptExtraction: async (id: string, overrides?: Record<string, unknown>): Promise<InvoiceResponse> => {
    const res = await api.patch<{ status: string; data: InvoiceResponse }>(`/documents/${id}/accept-extraction`, { overrides });
    return res.data.data;
  },

  reprocessDocument: async (id: string): Promise<{ message: string }> => {
    const res = await api.post<{ status: string; message: string }>(`/documents/${id}/reprocess`);
    return res.data;
  },

  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },
};
