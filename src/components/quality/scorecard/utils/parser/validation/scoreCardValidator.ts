
/**
 * Validation utilities for scorecard data
 */

import { ScoreCardData } from '../../../types';

/**
 * Validate scorecard data to ensure it has the minimum required fields
 * @param data Scorecard data to validate
 * @returns Whether the data is valid
 */
export const isValidScorecardData = (data: Partial<ScoreCardData>): boolean => {
  // Check for required top-level properties
  if (!data.week || !data.year || !data.location) {
    console.log("Validation failed: missing required top-level properties");
    return false;
  }
  
  // Check for company KPIs
  if (!Array.isArray(data.companyKPIs) || data.companyKPIs.length === 0) {
    console.log("Validation failed: missing company KPIs");
    return false;
  }
  
  // Check for driver KPIs
  if (!Array.isArray(data.driverKPIs) || data.driverKPIs.length === 0) {
    console.log("Validation failed: missing driver KPIs");
    return false;
  }
  
  // Additional validation: Check if at least one company KPI has real data
  const hasRealKPIData = data.companyKPIs.some(kpi => 
    typeof kpi.value === 'number' && 
    kpi.name.length > 0
  );
  
  if (!hasRealKPIData) {
    console.log("Validation failed: no real KPI data found");
    return false;
  }
  
  // Data is valid if it passes all checks
  return true;
};
