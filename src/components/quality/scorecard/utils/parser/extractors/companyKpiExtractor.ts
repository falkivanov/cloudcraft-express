
import { ScorecardKPI } from "../../../types";
import { determineStatus } from "../../helpers/statusHelper";

/**
 * Extract company KPIs from text content
 */
export const extractCompanyKPIs = (text: string): ScorecardKPI[] => {
  console.log("Extracting company KPIs from text");
  
  // Extract company KPIs using patterns
  const kpis: ScorecardKPI[] = [];
  
  // Typical safety metrics
  const safetyPattern = /Safety.*?(\d+(?:\.\d+)?)%?/i;
  const safetyMatch = text.match(safetyPattern);
  if (safetyMatch) {
    kpis.push({
      name: "Safety",
      value: parseFloat(safetyMatch[1]),
      target: 95,
      unit: "%",
      category: "safety",
      trend: "neutral",
      status: determineStatus("Safety", parseFloat(safetyMatch[1]))
    });
  }
  
  // Customer service metrics
  const dnrPattern = /DNR.*?(\d+(?:\.\d+)?)%?/i;
  const dnrMatch = text.match(dnrPattern);
  if (dnrMatch) {
    kpis.push({
      name: "DNR",
      value: parseFloat(dnrMatch[1]),
      target: 98.5,
      unit: "%",
      category: "customer",
      trend: "neutral",
      status: determineStatus("DNR", parseFloat(dnrMatch[1]))
    });
  }
  
  const dcrPattern = /DCR.*?(\d+(?:\.\d+)?)%?/i;
  const dcrMatch = text.match(dcrPattern);
  if (dcrMatch) {
    kpis.push({
      name: "DCR",
      value: parseFloat(dcrMatch[1]),
      target: 98,
      unit: "%",
      category: "customer",
      trend: "neutral",
      status: determineStatus("DCR", parseFloat(dcrMatch[1]))
    });
  }
  
  // Compliance metrics
  const podPattern = /POD.*?(\d+(?:\.\d+)?)%?/i;
  const podMatch = text.match(podPattern);
  if (podMatch) {
    kpis.push({
      name: "POD",
      value: parseFloat(podMatch[1]),
      target: 99,
      unit: "%",
      category: "compliance",
      trend: "neutral",
      status: determineStatus("POD", parseFloat(podMatch[1]))
    });
  }
  
  const ccPattern = /CC.*?(\d+(?:\.\d+)?)%?/i;
  const ccMatch = text.match(ccPattern);
  if (ccMatch) {
    kpis.push({
      name: "Customer Contact",
      value: parseFloat(ccMatch[1]),
      target: 95,
      unit: "%",
      category: "compliance",
      trend: "neutral",
      status: determineStatus("Customer Contact", parseFloat(ccMatch[1]))
    });
  }
  
  // If we couldn't find any KPIs, return some defaults
  if (kpis.length === 0) {
    console.log("No KPIs found, returning default set");
    return [
      {
        name: "Safety",
        value: 95,
        target: 95,
        unit: "%",
        category: "safety",
        trend: "neutral",
        status: "great"
      },
      {
        name: "DNR",
        value: 98.5,
        target: 98.5,
        unit: "%",
        category: "customer",
        trend: "neutral",
        status: "great"
      },
      {
        name: "DCR",
        value: 97,
        target: 98,
        unit: "%",
        category: "customer",
        trend: "neutral",
        status: "fair"
      },
      {
        name: "POD",
        value: 99,
        target: 99,
        unit: "%",
        category: "compliance",
        trend: "neutral",
        status: "great"
      },
      {
        name: "Customer Contact",
        value: 94,
        target: 95,
        unit: "%",
        category: "compliance",
        trend: "neutral",
        status: "fair"
      }
    ];
  }
  
  return kpis;
};

// Add a function to extract from structured data (for mainExtractor.ts)
export const extractCompanyKPIsFromStructure = (pageData: Record<number, any>): ScorecardKPI[] => {
  // For now, just combine text from all pages and use the regular extractor
  const combinedText = Object.values(pageData)
    .map(page => page.text || "")
    .join("\n\n");
  
  return extractCompanyKPIs(combinedText);
};
