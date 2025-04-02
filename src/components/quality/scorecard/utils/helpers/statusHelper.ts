
export interface TargetDefinition {
  name: string;
  value: number;
  unit: string;
  effectiveFromWeek?: number;
  effectiveFromYear?: number;
}

export interface StatusDefinition {
  status: string;
  color: string;
  icon?: React.ComponentType<any>;
}

// Define the KPI status type that's being used across files
export type KPIStatus = "poor" | "fair" | "great" | "fantastic" | "none" | "in compliance" | "not in compliance" | "at risk" | "needs improvement" | "on track" | "not applicable";

export const DEFAULT_TARGETS: TargetDefinition[] = [
  { name: "Vehicle Audit (VSA) Compliance", value: 95, unit: "%" },
  { name: "Safe Driving Metric (FICO)", value: 800, unit: "" },
  { name: "DVIC Compliance", value: 95, unit: "%" },
  { name: "Speeding Event Rate (Per 100 Trips)", value: 10, unit: "" },
  { name: "Mentor Adoption Rate", value: 80, unit: "%" },
  { name: "Breach of Contract (BOC)", value: 0, unit: "" },
  { name: "Working Hours Compliance (WHC)", value: 100, unit: "%" },
  { name: "Comprehensive Audit Score (CAS)", value: 100, unit: "%" },
  { name: "Customer escalation DPMO", value: 3500, unit: "DPMO" },
  { name: "Customer Delivery Feedback", value: 85, unit: "%" },
  { name: "Delivery Completion Rate (DCR)", value: 98.0, unit: "%" },
  { name: "Delivered Not Received (DNR DPMO)", value: 3000, unit: "DPMO" },
  { name: "Lost on Road (LoR) DPMO", value: 350, unit: "DPMO" },
  { name: "Photo-On-Delivery", value: 95, unit: "%" },
  { name: "Contact Compliance", value: 95, unit: "%" },
  { name: "Next Day Capacity Reliability", value: 98, unit: "%" },
  { name: "Capacity Reliability", value: 98, unit: "%" }
];

export function getDefaultTargetValue(kpiName: string): number {
  const target = DEFAULT_TARGETS.find(t => t.name === kpiName);
  return target ? target.value : 0;
}

export const STATUS_DEFINITIONS: { [key: string]: StatusDefinition } = {
  "At Risk": { status: "At Risk", color: "red" },
  "Needs Improvement": { status: "Needs Improvement", color: "orange" },
  "On Track": { status: "On Track", color: "green" },
  "Not Applicable": { status: "Not Applicable", color: "gray" }
};

/**
 * Determines the status of a KPI based on its value and name
 * @param kpiName The name of the KPI
 * @param value The current value of the KPI
 * @returns The status as a KPIStatus type
 */
export function determineStatus(kpiName: string, value: number): KPIStatus {
  // Handle special KPI types differently
  if (kpiName.includes("DNR DPMO") || kpiName.includes("Lost on Road") || 
      kpiName.includes("Customer escalation") || kpiName.includes("DPMO")) {
    // For DPMO metrics, lower is better
    const target = getDefaultTargetForKPI(kpiName);
    if (value <= target * 0.5) return "fantastic";
    if (value <= target * 0.75) return "great";
    if (value <= target) return "fair";
    return "poor";
  }
  
  if (kpiName.includes("FICO") || kpiName.includes("Safe Driving")) {
    // For FICO score, higher is better with different thresholds
    if (value >= 850) return "fantastic";
    if (value >= 800) return "great";
    if (value >= 750) return "fair";
    return "poor";
  }
  
  if (kpiName.includes("Breach of Contract") || kpiName.includes("BOC")) {
    // For BOC, 0 is compliant, anything else is not
    return value === 0 ? "in compliance" : "not in compliance";
  }
  
  if (kpiName.includes("Speeding Event")) {
    // For speeding events, lower is better
    const target = getDefaultTargetForKPI(kpiName);
    if (value <= target * 0.5) return "fantastic";
    if (value <= target * 0.75) return "great";
    if (value <= target) return "fair";
    return "poor";
  }
  
  // For most percentage-based KPIs
  const target = getDefaultTargetForKPI(kpiName);
  
  if (target === 0) {
    // Edge case for metrics where target is 0
    if (value === 0) return "fantastic";
    if (value <= 5) return "great";
    if (value <= 10) return "fair";
    return "poor";
  }
  
  // Default case: percentage-based metrics where higher is better
  const ratio = value / target;
  
  if (ratio >= 1.05) return "fantastic";
  if (ratio >= 1.0) return "great";
  if (ratio >= 0.95) return "fair";
  return "poor";
}

export function getDefaultTargetForKPI(kpiName: string, currentWeek?: number, currentYear?: number): number {
  try {
    const STORAGE_KEY = "scorecard_custom_targets";
    const savedTargetsJson = localStorage.getItem(STORAGE_KEY);
    
    if (!savedTargetsJson) {
      // Fallback to the hardcoded default values from the constants
      const defaultTarget = DEFAULT_TARGETS.find(t => t.name === kpiName);
      return defaultTarget?.value || 0;
    }
    
    const savedTargets = JSON.parse(savedTargetsJson) as TargetDefinition[];
    const matchingTargets = savedTargets.filter(t => t.name === kpiName);
    
    if (matchingTargets.length === 0) {
      return 0; // No matching target found
    }
    
    // If currentWeek and currentYear are provided, try to find a target that is effective from that date
    if (currentWeek && currentYear) {
      // First, filter targets that have effective dates
      const targetsWithEffectiveDates = matchingTargets.filter(
        t => t.effectiveFromWeek && t.effectiveFromYear
      );
      
      // Sort them by date (newest first)
      targetsWithEffectiveDates.sort((a, b) => {
        const aYear = a.effectiveFromYear || 0;
        const bYear = b.effectiveFromYear || 0;
        
        if (aYear !== bYear) {
          return bYear - aYear; // Higher year first
        }
        
        const aWeek = a.effectiveFromWeek || 0;
        const bWeek = b.effectiveFromWeek || 0;
        return bWeek - aWeek; // Higher week first
      });
      
      // Find the most recent applicable target
      for (const target of targetsWithEffectiveDates) {
        const effectiveYear = target.effectiveFromYear || 0;
        const effectiveWeek = target.effectiveFromWeek || 0;
        
        if (
          (effectiveYear < currentYear) || 
          (effectiveYear === currentYear && effectiveWeek <= currentWeek)
        ) {
          console.info(`Using effective date target for ${kpiName}: ${target.value} (effective from week ${effectiveWeek}/${effectiveYear})`);
          return target.value;
        }
      }
    }
    
    // If no effective date match or no current date provided, just use the first matching target
    return matchingTargets[0].value;
    
  } catch (error) {
    console.error(`Error getting target for KPI ${kpiName}:`, error);
    return 0;
  }
}
