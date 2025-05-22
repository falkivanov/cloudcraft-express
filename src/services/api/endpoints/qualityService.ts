
import { get } from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResponse } from '../types';

/**
 * Qualitätsdaten-Service
 * 
 * Stellt Funktionen bereit, um auf Qualitätsdaten zuzugreifen.
 */

// Scorecard-Statistiken abrufen
export async function getScorecardStatistics(
  timePeriod: string = "week", 
  location?: string
) {
  try {
    const params: Record<string, string> = { time_period: timePeriod };
    
    if (location) params.location = location;
    
    const response = await get<any>(API_ENDPOINTS.quality.scorecard.stats, params);
    return response;
  } catch (error) {
    console.error("Error fetching scorecard statistics:", error);
    return { success: false, error: "Fehler beim Abrufen der Scorecard-Statistiken" };
  }
}

// Fahrer-Performance-Daten abrufen
export async function getDriverPerformance(
  timePeriod: string = "week",
  metricType?: string,
  minScore?: number,
  maxScore?: number
) {
  try {
    const params: Record<string, string> = { time_period: timePeriod };
    
    if (metricType) params.metric_type = metricType;
    if (minScore !== undefined) params.min_score = minScore.toString();
    if (maxScore !== undefined) params.max_score = maxScore.toString();
    
    const response = await get<any>(API_ENDPOINTS.quality.drivers.performance, params);
    return response;
  } catch (error) {
    console.error("Error fetching driver performance:", error);
    return { success: false, error: "Fehler beim Abrufen der Fahrer-Performance", data: [] };
  }
}

// Kundenkontakt-Compliance-Daten abrufen
export async function getCustomerContactCompliance(week?: number, year?: number) {
  try {
    const params: Record<string, string> = {};
    
    if (week !== undefined) params.week = week.toString();
    if (year !== undefined) params.year = year.toString();
    
    const response = await get<any>(API_ENDPOINTS.quality.customerContact.compliance, params);
    return response;
  } catch (error) {
    console.error("Error fetching customer contact compliance:", error);
    return { success: false, error: "Fehler beim Abrufen der Kundenkontakt-Compliance" };
  }
}

// Qualitätsberichte filtern
export async function filterQualityReports(options?: {
  reportType?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  search?: string;
}) {
  try {
    const params: Record<string, string> = {};
    
    if (options?.reportType) params.report_type = options.reportType;
    if (options?.startDate) params.start_date = options.startDate;
    if (options?.endDate) params.end_date = options.endDate;
    if (options?.location) params.location = options.location;
    if (options?.search) params.search = options.search;
    
    const response = await get<any>(API_ENDPOINTS.quality.reports.filter, params);
    return response;
  } catch (error) {
    console.error("Error filtering quality reports:", error);
    return { success: false, error: "Fehler beim Filtern der Qualitätsberichte", data: [] };
  }
}

// Trendverläufe für Metriken abrufen
export async function getMetricsTrends(
  metricType: string,
  timePeriod: string = "week",
  location?: string
) {
  try {
    const params: Record<string, string> = { 
      metric_type: metricType,
      time_period: timePeriod
    };
    
    if (location) params.location = location;
    
    const response = await get<any>(API_ENDPOINTS.quality.metrics.trends, params);
    return response;
  } catch (error) {
    console.error("Error fetching metrics trends:", error);
    return { success: false, error: "Fehler beim Abrufen der Metrik-Trends" };
  }
}
