
/**
 * Scorecard-Service für API-Anfragen zur Scorecard-Verarbeitung
 */

import { API_ENDPOINTS } from '../config';
import { uploadFile, post, get } from '../client';
import { ApiResponse } from '../types';
import { DriverKPI, ScoreCardData } from '@/components/quality/scorecard/types';

/**
 * Extrahiert Scorecard-Daten aus einer PDF-Datei
 * Verwendet die neue Backend-Integration mit dem funktionierenden Parser
 */
export async function extractScorecardFromPDF(file: File): Promise<ApiResponse<ScoreCardData>> {
  console.log("Sending PDF to backend API for extraction:", file.name);
  
  try {
    const result = await uploadFile<ScoreCardData>(API_ENDPOINTS.scorecard.extract, file);
    
    if (result.success && result.data) {
      console.log("Scorecard extraction successful:", result.data);
      return result;
    } else {
      console.error("Scorecard extraction failed:", result.error);
      return result;
    }
  } catch (error) {
    console.error("Error during scorecard extraction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unbekannter Fehler bei der Extraktion"
    };
  }
}

/**
 * Lädt eine bereits verarbeitete Scorecard anhand ihrer ID
 */
export async function getScorecardById(id: string): Promise<ApiResponse<ScoreCardData>> {
  return get<ScoreCardData>(`${API_ENDPOINTS.scorecard.base}/${id}`);
}

/**
 * Lädt eine Scorecard anhand von Woche und Jahr
 */
export async function getScorecardByWeek(week: number, year: number): Promise<ApiResponse<ScoreCardData>> {
  return get<ScoreCardData>(`${API_ENDPOINTS.scorecard.base}/week/${week}/year/${year}`);
}

/**
 * Extrahiert Fahrer-KPIs aus Text (Legacy-Support)
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
 * Extrahiert Unternehmens-KPIs aus Text (Legacy-Support)
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
 * Extrahiert Metadaten aus Text (Legacy-Support)
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
