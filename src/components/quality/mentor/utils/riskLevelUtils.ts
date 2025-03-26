
/**
 * Utility functions for handling risk levels in Mentor data
 */

/**
 * Get CSS class name based on risk level
 * @param risk Risk level string (e.g., "High Risk", "Medium Risk", "Low Risk")
 * @returns Tailwind CSS class names for styling the risk level
 */
export function getRiskColorClass(risk: string): string {
  const lowerRisk = risk.toLowerCase();

  if (lowerRisk.includes("high")) {
    return "bg-red-50 text-red-700 font-medium";
  } 
  
  if (lowerRisk.includes("medium")) {
    return "bg-amber-50 text-amber-700 font-medium";
  }
  
  return "bg-green-50 text-green-700 font-medium";
}

/**
 * Get a standardized risk level string
 * @param risk Raw risk level string
 * @returns Standardized risk level
 */
export function standardizeRiskLevel(risk: string): string {
  const lowerRisk = (risk || "").toLowerCase();
  
  if (lowerRisk.includes("high")) return "High Risk";
  if (lowerRisk.includes("medium")) return "Medium Risk";
  if (lowerRisk.includes("low")) return "Low Risk";
  
  return risk || "Unknown";
}
