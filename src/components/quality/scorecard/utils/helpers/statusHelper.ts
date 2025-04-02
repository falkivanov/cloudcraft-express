
/**
 * KPI status type to ensure we use only valid status values
 */
export type KPIStatus = "fantastic" | "great" | "fair" | "poor" | "none" | "in compliance" | "not in compliance";

/**
 * Type for target definitions with effective week
 */
export type TargetDefinition = {
  name: string;
  value: number;
  effectiveFromWeek?: number;
  effectiveFromYear?: number;
  unit?: string;
};

/**
 * Get the default target value for a KPI
 */
export const getDefaultTargetForKPI = (kpiName: string, weekNum?: number, year?: number): number => {
  // First check if we have custom targets in localStorage
  try {
    const savedTargets = localStorage.getItem("scorecard_custom_targets");
    if (savedTargets && weekNum && year) {
      const targets = JSON.parse(savedTargets);
      
      // Find all targets for this KPI, sorted by effective date (newest first)
      const relevantTargets = targets
        .filter((t: TargetDefinition) => t.name === kpiName)
        .sort((a: TargetDefinition, b: TargetDefinition) => {
          // Sort by year first, then by week
          const aYear = a.effectiveFromYear || 0;
          const bYear = b.effectiveFromYear || 0;
          
          if (aYear !== bYear) return bYear - aYear;
          
          const aWeek = a.effectiveFromWeek || 0;
          const bWeek = b.effectiveFromWeek || 0;
          return bWeek - aWeek;
        });
      
      // Find the most recent target that is applicable for the given week
      for (const target of relevantTargets) {
        const targetYear = target.effectiveFromYear || 0;
        const targetWeek = target.effectiveFromWeek || 0;
        
        if ((targetYear < year) || (targetYear === year && targetWeek <= weekNum)) {
          return target.value;
        }
      }
      
      // If no target with effective date found, look for targets without date restrictions
      const defaultTarget = targets.find((t: TargetDefinition) => 
        t.name === kpiName && (!t.effectiveFromWeek || !t.effectiveFromYear)
      );
      
      if (defaultTarget) {
        return defaultTarget.value;
      }
    }
  } catch (error) {
    console.error("Error loading custom targets:", error);
  }
  
  // Fall back to hardcoded targets
  const targets: { [key: string]: number } = {
    "Delivery Completion Rate (DCR)": 98.0,
    "Delivered Not Received (DNR DPMO)": 3000,
    "Photo-On-Delivery": 95,
    "Contact Compliance": 95,
    "Customer escalation DPMO": 3500,
    "Vehicle Audit (VSA) Compliance": 95,
    "DVIC Compliance": 95,
    "Safe Driving Metric (FICO)": 800,
    "Capacity Reliability": 98,
    "Working Hours Compliance (WHC)": 100,
    "Breach of Contract (BOC)": 0,
    "Lost on Road (LoR) DPMO": 350,
    "Speeding Event Rate (Per 100 Trips)": 10,
    "Mentor Adoption Rate": 80,
    "Customer Delivery Feedback": 85,
    "Comprehensive Audit Score (CAS)": 100,
    "Next Day Capacity Reliability": 98
  };
  
  return targets[kpiName] || 95;
};

/**
 * Determine the status of a KPI based on its value
 */
export const determineStatus = (kpiName: string, value: number): KPIStatus => {
  // Special case for BOC
  if (kpiName === "Breach of Contract (BOC)") {
    return value === 0 ? "none" : "not in compliance";
  }
  
  // For DPMO metrics, lower is better
  if (kpiName.includes("DPMO")) {
    if (value < 2000) return "fantastic";
    if (value < 3000) return "great";
    if (value < 4000) return "fair";
    return "poor";
  }
  
  // For FICO score
  if (kpiName.includes("FICO")) {
    if (value > 850) return "fantastic";
    if (value > 800) return "great";
    if (value > 750) return "fair";
    return "poor";
  }
  
  // For percentage metrics
  if (value > 98) return "fantastic";
  if (value > 95) return "great";
  if (value > 90) return "fair";
  return "poor";
};
