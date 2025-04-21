
/**
 * PDF-Service für API-Anfragen zur PDF-Verarbeitung
 */

import { API_ENDPOINTS } from '../config';
import { post, uploadFile } from '../client';
import { ApiResponse, FileUploadResponse, ProcessingStatusResponse } from '../types';

/**
 * Lädt eine PDF-Datei hoch und startet die Verarbeitung
 */
export async function uploadPDF(file: File, options?: {
  extractText?: boolean;
  extractStructure?: boolean;
}): Promise<ApiResponse<FileUploadResponse['data']>> {
  const additionalFields: Record<string, string> = {};
  
  if (options) {
    if (options.extractText !== undefined) {
      additionalFields.extractText = options.extractText.toString();
    }
    if (options.extractStructure !== undefined) {
      additionalFields.extractStructure = options.extractStructure.toString();
    }
  }
  
  return uploadFile<FileUploadResponse['data']>(
    API_ENDPOINTS.pdf.uploadFile, 
    file, 
    additionalFields
  );
}

/**
 * Extrahiert Text aus einer PDF-Datei mit pdfplumber
 */
export async function extractTextFromPDF(file: File): Promise<ApiResponse<Record<number, string>>> {
  return uploadFile(API_ENDPOINTS.pdf.extractText, file);
}

/**
 * Extrahiert strukturierte Daten aus einer PDF-Datei
 */
export async function extractStructureFromPDF(file: File): Promise<ApiResponse<Record<number, any>>> {
  return uploadFile(API_ENDPOINTS.pdf.extractStructure, file);
}

/**
 * Prüft den Status eines asynchronen Verarbeitungsjobs
 */
export async function checkProcessingStatus(processingId: string): Promise<ApiResponse<ProcessingStatusResponse['data']>> {
  return post<ProcessingStatusResponse['data']>(
    API_ENDPOINTS.processing.status,
    { processingId }
  );
}

/**
 * Bricht einen laufenden Verarbeitungsjob ab
 */
export async function cancelProcessing(processingId: string): Promise<ApiResponse<void>> {
  return post(API_ENDPOINTS.processing.cancel, { processingId });
}
