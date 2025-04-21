
/**
 * Typdefinitionen für die API-Kommunikation
 */

// Basisdefinition für API-Antworten
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Definition für Upload-Antworten
export interface FileUploadResponse extends ApiResponse<{
  fileId: string;
  filename: string;
  processingStatus: 'queued' | 'processing' | 'completed' | 'failed';
  processingId?: string;
}> {}

// Definition für Verarbeitungsstatus
export interface ProcessingStatusResponse extends ApiResponse<{
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  resultUrl?: string;
  error?: string;
}> {}
