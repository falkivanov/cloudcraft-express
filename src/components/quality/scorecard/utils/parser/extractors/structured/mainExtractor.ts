
import { CompanyKPI } from "../../../../types";
import { extractCompanyKPIs } from "../companyKpiExtractor";

/**
 * Extract company KPIs from a structured representation of the PDF
 * @param structData Structured data from the PDF
 * @returns Array of CompanyKPI objects
 */
export function extractFromStructuredData(structData: any): CompanyKPI[] {
  // This is just a wrapper for extractCompanyKPIs
  // In the future, we could enhance this to use the structured data
  return [];
}

/**
 * Compatibility function for the main extractor with structured data 
 */
export function extractCompanyKPIsFromStructure(structData: any): CompanyKPI[] {
  return extractFromStructuredData(structData);
}
