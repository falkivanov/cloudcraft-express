
/**
 * Scorecard-Service für API-Anfragen zur Scorecard-Verarbeitung
 */

import { API_ENDPOINTS } from '../config';
import { uploadFile, post } from '../client';
import { ApiResponse } from '../types';
import { DriverKPI, ScoreCardData } from '@/components/quality/scorecard/types';

/**
 * Extrahiert Scorecard-Daten aus einer PDF-Datei
 */
export async function extractScorecardFromPDF(file: File): Promise<ApiResponse<ScoreCardData>> {
  return uploadFile<ScoreCardData>(API_ENDPOINTS.scorecard.extract, file);
}

/**
 * Extrahiert Fahrer-KPIs aus Text
 */
export async function extractDriverKPIs(
  text: string, 
  pageData?: Record<number, any>
): Promise<ApiResponse<DriverKPI[]>> {
  return post<DriverKPI[]>(
    API_ENDPOINTS.scorecard.extractDrivers,
    { text, pageData }
  );
}

/**
 * Extrahiert Unternehmens-KPIs aus Text
 */
export async function extractCompanyKPIs(
  text: string, 
  pageData?: Record<number, any>
): Promise<ApiResponse<any[]>> {
  return post(
    API_ENDPOINTS.scorecard.extractCompanyKPIs,
    { text, pageData }
  );
}

/**
 * Extrahiert Metadaten aus Text (wie Woche, Jahr, etc.)
 */
export async function extractMetadata(
  text: string, 
  filename: string
): Promise<ApiResponse<any>> {
  return post(
    API_ENDPOINTS.scorecard.extractMetadata,
    { text, filename }
  );
}
