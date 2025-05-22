
import { get } from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResponse } from '../types';

/**
 * Get scorecard statistics for a specific time period
 */
export async function getScorecardStatistics(options?: {
  timePeriod?: string;
  location?: string;
}) {
  try {
    const params: Record<string, string> = {};
    
    if (options?.timePeriod) params.time_period = options.timePeriod;
    if (options?.location) params.location = options.location;
    
    const response = await get(API_ENDPOINTS.quality.scorecard.stats, params);
    return response;
  } catch (error) {
    console.error("Error fetching scorecard statistics:", error);
    return { success: false, error: "Fehler beim Abrufen der Scorecard-Statistiken" };
  }
}

/**
 * Get driver performance data filtered by various criteria
 */
export async function getDriverPerformance(options?: {
  timePeriod?: string;
  metricType?: string;
  minScore?: number;
  maxScore?: number;
}) {
  try {
    const params: Record<string, string> = {};
    
    if (options?.timePeriod) params.time_period = options.timePeriod;
    if (options?.metricType) params.metric_type = options.metricType;
    if (options?.minScore !== undefined) params.min_score = options.minScore.toString();
    if (options?.maxScore !== undefined) params.max_score = options.maxScore.toString();
    
    const response = await get(API_ENDPOINTS.quality.drivers.performance, params);
    return response;
  } catch (error) {
    console.error("Error fetching driver performance:", error);
    return { success: false, error: "Fehler beim Abrufen der Fahrerleistung", data: [] };
  }
}

/**
 * Get customer contact compliance for a specific week and year
 */
export async function getCustomerContactCompliance(options?: {
  week?: number;
  year?: number;
}) {
  try {
    const params: Record<string, string> = {};
    
    if (options?.week !== undefined) params.week = options.week.toString();
    if (options?.year !== undefined) params.year = options.year.toString();
    
    const response = await get(API_ENDPOINTS.quality.customerContact.compliance, params);
    return response;
  } catch (error) {
    console.error("Error fetching customer contact compliance:", error);
    return { success: false, error: "Fehler beim Abrufen der Kundenkonktakt-Compliance" };
  }
}

/**
 * Filter quality reports based on various criteria
 */
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
    
    const response = await get(API_ENDPOINTS.quality.reports.filter, params);
    return response;
  } catch (error) {
    console.error("Error filtering quality reports:", error);
    return { success: false, error: "Fehler beim Filtern der Qualitätsberichte", data: [] };
  }
}

/**
 * Get trends for specific quality metrics over time
 */
export async function getMetricsTrends(metricType: string, options?: {
  timePeriod?: string;
  location?: string;
}) {
  try {
    const params: Record<string, string> = {
      metric_type: metricType
    };
    
    if (options?.timePeriod) params.time_period = options.timePeriod;
    if (options?.location) params.location = options.location;
    
    const response = await get(API_ENDPOINTS.quality.metrics.trends, params);
    return response;
  } catch (error) {
    console.error("Error fetching metrics trends:", error);
    return { success: false, error: "Fehler beim Abrufen der Metriktrends" };
  }
}
