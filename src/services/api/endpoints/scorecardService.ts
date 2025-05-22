
/**
 * Scorecard-Service für API-Anfragen zur Scorecard-Verarbeitung
 */

import { API_ENDPOINTS } from '../config';
import { uploadFile, post, get } from '../client';
import { ApiResponse } from '../types';
import { DriverKPI, ScoreCardData } from '@/components/quality/scorecard/types';

/**
 * Extrahiert Scorecard-Daten aus einer PDF-Datei
 */
export async function extractScorecardFromPDF(file: File): Promise<ApiResponse<ScoreCardData>> {
  console.log("Sending PDF to backend API for extraction:", file.name);
  return uploadFile<ScoreCardData>(API_ENDPOINTS.scorecard.extract, file);
}

/**
 * Lädt eine bereits verarbeitete Scorecard anhand ihrer ID
 */
export async function getScorecardById(id: string): Promise<ApiResponse<ScoreCardData>> {
  return get<ScoreCardData>(`${API_ENDPOINTS.scorecard.base}/${id}`);
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

/**
 * Lädt alle verfügbaren Scorecards
 */
export async function getAllScorecards(options?: {
  week?: number;
  year?: number;
  location?: string;
}): Promise<ApiResponse<ScoreCardData[]>> {
  // Convert number values to strings to match the expected Record<string, string> type
  const stringOptions: Record<string, string> = {};
  
  if (options) {
    if (options.week !== undefined) stringOptions.week = options.week.toString();
    if (options.year !== undefined) stringOptions.year = options.year.toString();
    if (options.location !== undefined) stringOptions.location = options.location;
  }
  
  return get<ScoreCardData[]>(API_ENDPOINTS.scorecard.list, stringOptions);
}

/**
 * Überprüft den Verarbeitungsstatus einer Scorecard-Extraktion
 */
export async function checkProcessingStatus(processingId: string): Promise<ApiResponse<any>> {
  return post(API_ENDPOINTS.processing.status, { processingId });
}
