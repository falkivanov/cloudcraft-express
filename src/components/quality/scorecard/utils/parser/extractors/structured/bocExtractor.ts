
import { ScorecardKPI } from '../../../../types';

/**
 * Special handling for Breach of Contract (BOC) KPI
 * BOC doesn't have numeric values, only status ("none" or "not in compliance")
 */
export function extractBOC(pageData: Record<number, any>, companyKPIs: ScorecardKPI[]): void {
  // Check if BOC exists and update its status correctly
  for (const kpi of companyKPIs) {
    if (kpi.name.includes("Breach of Contract") || kpi.name.includes("BOC")) {
      // BOC should have a status of either "none" or "not in compliance"
      // and we don't care about the numeric value 
      kpi.value = 0; // Reset value to 0
      kpi.target = 0; // Reset target to 0
      
      // Check for status in text like "in compliance" or "not in compliance"
      if (pageData[2]?.text) {
        if (pageData[2].text.toLowerCase().includes("not in compliance")) {
          kpi.status = "not in compliance";
        } else {
          kpi.status = "none"; // Default to "none" (in compliance)
        }
      }
    }
  }
}
