
import { ScorecardKPI } from "../../types";
import { determineStatus, getDefaultTargetForKPI, KPIStatus } from '../helpers/statusHelper';

/**
 * Extract company KPIs from text content
 */
export const extractCompanyKPIs = (text: string): ScorecardKPI[] => {
  // Try to identify KPI patterns in the text
  const kpis: ScorecardKPI[] = [];
  
  // Look for common KPI names and patterns
  const kpiPatterns = [
    { name: "Delivery Completion Rate (DCR)", pattern: /DCR[:\s]+(\d+(?:\.\d+)?)\s*%/i },
    { name: "Delivered Not Received (DNR DPMO)", pattern: /DNR\s+DPMO[:\s]+(\d+(?:\.\d+)?)/i },
    { name: "Photo-On-Delivery", pattern: /Photo[- ]On[- ]Delivery[:\s]+(\d+(?:\.\d+)?)\s*%/i },
    { name: "Contact Compliance", pattern: /Contact\s+Compliance[:\s]+(\d+(?:\.\d+)?)\s*%/i },
    { name: "Customer escalation DPMO", pattern: /Customer\s+escalation\s+DPMO[:\s]+(\d+(?:\.\d+)?)/i },
    { name: "Vehicle Audit (VSA) Compliance", pattern: /VSA[:\s]+(\d+(?:\.\d+)?)\s*%/i },
    { name: "DVIC Compliance", pattern: /DVIC[:\s]+(\d+(?:\.\d+)?)\s*%/i },
    { name: "Safe Driving Metric (FICO)", pattern: /FICO[:\s]+(\d+(?:\.\d+)?)/i },
    { name: "Capacity Reliability", pattern: /Capacity\s+Reliability[:\s]+(\d+(?:\.\d+)?)\s*%/i },
  ];
  
  console.log("Extracting company KPIs from page 2");
  
  // Check each pattern against the text
  kpiPatterns.forEach(({ name, pattern }) => {
    const match = text.match(pattern);
    if (match) {
      console.log(`Found KPI: ${name} = ${match[1]}`);
      const value = parseFloat(match[1]);
      kpis.push({
        name,
        value,
        target: getDefaultTargetForKPI(name),
        unit: name.includes("DPMO") ? "DPMO" : "%",
        trend: "neutral",
        status: determineStatus(name, value)
      });
    }
  });
  
  // If we didn't find any KPIs, return a default set
  if (kpis.length === 0) {
    console.warn("No company KPIs found on page 2, using default values");
    return [
      {
        name: "Delivery Completion Rate (DCR)",
        value: 98.5,
        target: 98.0,
        unit: "%",
        trend: "up",
        status: "fantastic" as KPIStatus
      },
      {
        name: "Delivered Not Received (DNR DPMO)",
        value: 2500,
        target: 3000,
        unit: "DPMO",
        trend: "down",
        status: "great" as KPIStatus
      },
      {
        name: "Contact Compliance",
        value: 92,
        target: 95,
        unit: "%",
        trend: "up",
        status: "fair" as KPIStatus
      }
    ];
  }
  
  return kpis;
};
