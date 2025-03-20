
/**
 * KPI status type to ensure we use only valid status values
 */
export type KPIStatus = "fantastic" | "great" | "fair" | "poor" | "none" | "in compliance" | "not in compliance";

/**
 * Get the default target value for a KPI
 */
export const getDefaultTargetForKPI = (kpiName: string): number => {
  const targets: { [key: string]: number } = {
    "Delivery Completion Rate (DCR)": 98.0,
    "Delivered Not Received (DNR DPMO)": 3000,
    "Photo-On-Delivery": 95,
    "Contact Compliance": 95,
    "Customer escalation DPMO": 3500,
    "Vehicle Audit (VSA) Compliance": 95,
    "DVIC Compliance": 95,
    "Safe Driving Metric (FICO)": 800,
    "Capacity Reliability": 98
  };
  
  return targets[kpiName] || 95;
};

/**
 * Determine the status of a KPI based on its value
 */
export const determineStatus = (kpiName: string, value: number): KPIStatus => {
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
