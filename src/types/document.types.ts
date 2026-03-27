export type DocumentProcessingStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

export interface DocumentResponse {
  id:               string;
  originalName:     string;
  mimeType:         string;
  size:             number;
  s3Key:            string;
  organizationId:   string;
  uploadedBy:       string | null;
  processingStatus: DocumentProcessingStatus;
  invoice: {
    id:     string;
    status:  'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'FAILED'; // Extracted for simple import resolution avoiding circular deps
    confidenceScore?: number;
    isLowConfidence?: boolean;
  } | null;
  createdAt: string;
}

export interface UploadUrlResponse {
  documentId:       string;
  uploadUrl:        string;
  expiresInSeconds: number;
  s3Key:            string;
}

export interface AIStatusResponse {
  documentId:            string;
  processingStatus:      DocumentProcessingStatus;
  invoiceId:             string | null;
  confidenceScore:       number | null;
  isLowConfidence:       boolean;
  processingStartedAt:   string | null;
  processingCompletedAt: string | null;
  processingFailedAt:    string | null;
  errorMessage:          string | null;
  retryCount:            number;
  extractionNotes:       string | null;
}

export interface ExtractionPreviewResponse {
  documentId:      string;
  invoiceId:       string;
  rawExtraction:   LLMExtractionResult;
  confidenceScore: number;
  isLowConfidence: boolean;
  extractionNotes: string | null;
}

export interface LLMExtractionResult {
  invoiceNumber:  string | null;
  invoiceDate:    string | null;
  vendorName:     string | null;
  vendorGstin:    string | null;
  totalAmount:    number | null;
  gstAmount:      number | null;
  cgstAmount:     number | null;
  sgstAmount:     number | null;
  igstAmount:     number | null;
  items: {
    description: string;
    hsnCode:     string | null;
    quantity:    number;
    unitPrice:   number;
    amount:      number;
    taxRate:     number;
  }[];
  confidenceScore: number;
  extractionNotes: string | null;
}

export interface DocumentListFilters {
  processingStatus?: DocumentProcessingStatus;
  page?:             number;
  limit?:            number;
}
