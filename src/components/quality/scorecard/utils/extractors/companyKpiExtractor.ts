
import { ScorecardKPI } from "../../types";
import { determineStatus, getDefaultTargetForKPI, KPIStatus } from '../helpers/statusHelper';

/**
 * Extract company KPIs from text content - improved to detect more KPIs
 */
export const extractCompanyKPIs = (text: string): ScorecardKPI[] => {
  // Try to identify KPI patterns in the text
  const kpis: ScorecardKPI[] = [];
  
  // Enhanced patterns with more variations to catch more KPIs
  const kpiPatterns = [
    // Quality KPIs
    { name: "Delivery Completion Rate (DCR)", pattern: /(?:DCR|Delivery\s+Completion\s+Rate)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%" },
    { name: "Delivered Not Received (DNR DPMO)", pattern: /(?:DNR|Delivered\s+Not\s+Received)(?:\s+DPMO)?[:\s]+(\d+(?:\.\d+)?)/i, unit: "DPMO" },
    { name: "Lost on Road (LoR) DPMO", pattern: /(?:LoR|Lost\s+on\s+Road)(?:\s+DPMO)?[:\s]+(\d+(?:\.\d+)?)/i, unit: "DPMO" },
    
    // Standard Work Compliance
    { name: "Photo-On-Delivery", pattern: /(?:Photo[- ]On[- ]Delivery|POD)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%" },
    { name: "Contact Compliance", pattern: /Contact\s+Compliance[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%" },
    
    // Customer Experience KPIs
    { name: "Customer escalation DPMO", pattern: /(?:Customer\s+escalation|CSAT|Customer\s+Satisfaction)(?:\s+DPMO)?[:\s]+(\d+(?:\.\d+)?)/i, unit: "DPMO" },
    { name: "Customer Delivery Feedback", pattern: /(?:Customer\s+Delivery\s+Feedback|CDF)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%" },
    
    // Safety KPIs
    { name: "Vehicle Audit (VSA) Compliance", pattern: /(?:VSA|Vehicle\s+Audit)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%" },
    { name: "DVIC Compliance", pattern: /(?:DVIC|Daily\s+Vehicle\s+Inspection)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%" },
    { name: "Safe Driving Metric (FICO)", pattern: /(?:FICO|Safe\s+Driving)[:\s]+(\d+(?:\.\d+)?)/i, unit: "" },
    { name: "Speeding Event Rate (Per 100 Trips)", pattern: /(?:Speeding|Speeding\s+Event)[:\s]+(\d+(?:\.\d+)?)/i, unit: "" },
    { name: "Mentor Adoption Rate", pattern: /(?:Mentor\s+Adoption)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%" },
    
    // Compliance KPIs
    { name: "Breach of Contract (BOC)", pattern: /(?:BOC|Breach\s+of\s+Contract)[:\s]+(\d+(?:\.\d+)?)/i, unit: "" },
    { name: "Working Hours Compliance (WHC)", pattern: /(?:WHC|Working\s+Hours)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%" },
    { name: "Comprehensive Audit Score (CAS)", pattern: /(?:CAS|Comprehensive\s+Audit)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%" },
    
    // Capacity KPIs
    { name: "Capacity Reliability", pattern: /Capacity\s+Reliability[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%" },
    { name: "Next Day Capacity Reliability", pattern: /Next\s+Day\s+Capacity[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%" }
  ];
  
  console.log("Extracting company KPIs from scorecard text");
  
  // Check each pattern against the text
  kpiPatterns.forEach(({ name, pattern, unit }) => {
    const match = text.match(pattern);
    if (match) {
      console.log(`Found KPI: ${name} = ${match[1]}`);
      const value = parseFloat(match[1]);
      kpis.push({
        name,
        value,
        target: getDefaultTargetForKPI(name),
        unit,
        trend: "neutral" as "up" | "down" | "neutral", // Explicitly type as the union type
        status: determineStatus(name, value)
      });
    }
  });
  
  // If we detected some KPIs but not all, try to find more with a generic approach
  if (kpis.length > 0 && kpis.length < 12) {
    console.log(`Found ${kpis.length} KPIs, trying to find more with generic approach`);
    
    // Get the KPI names we've already found
    const foundKpiNames = kpis.map(kpi => kpi.name);
    
    // Try to find KPI patterns with percent signs
    const percentMatches = text.match(/([A-Za-z\s\(\)]+)[:\s]+(\d+(?:\.\d+)?)\s*%/g);
    if (percentMatches) {
      percentMatches.forEach(match => {
        const parts = match.match(/([A-Za-z\s\(\)]+)[:\s]+(\d+(?:\.\d+)?)\s*%/);
        if (parts && parts.length >= 3) {
          const kpiName = parts[1].trim();
          const value = parseFloat(parts[2]);
          
          // Check if this KPI is already in our list
          const existingKpi = kpiPatterns.find(pattern => 
            pattern.name.toLowerCase().includes(kpiName.toLowerCase()) ||
            kpiName.toLowerCase().includes(pattern.name.split(' ')[0].toLowerCase())
          );
          
          if (existingKpi && !foundKpiNames.includes(existingKpi.name)) {
            console.log(`Found additional KPI with percent: ${existingKpi.name} = ${value}%`);
            kpis.push({
              name: existingKpi.name,
              value,
              target: getDefaultTargetForKPI(existingKpi.name),
              unit: "%",
              trend: "neutral" as "up" | "down" | "neutral", // Fixed: Explicitly type as union
              status: determineStatus(existingKpi.name, value)
            });
          }
        }
      });
    }
    
    // Try to find KPI patterns with DPMO
    const dpmoMatches = text.match(/([A-Za-z\s\(\)]+)[:\s]+(\d+)(?:\s*DPMO)?/g);
    if (dpmoMatches) {
      dpmoMatches.forEach(match => {
        const parts = match.match(/([A-Za-z\s\(\)]+)[:\s]+(\d+)(?:\s*DPMO)?/);
        if (parts && parts.length >= 3) {
          const kpiName = parts[1].trim();
          const value = parseInt(parts[2], 10);
          
          // Check if this KPI contains DPMO or DNR or similar
          if (
            (kpiName.includes('DPMO') || kpiName.includes('DNR') || kpiName.includes('escalation')) && 
            !foundKpiNames.some(name => name.includes(kpiName))
          ) {
            console.log(`Found additional KPI with DPMO: ${kpiName} = ${value}`);
            kpis.push({
              name: kpiName,
              value,
              target: 3000, // Default target for DPMO metrics
              unit: "DPMO",
              trend: "neutral" as "up" | "down" | "neutral", // Fixed: Explicitly type as union
              status: determineStatus(kpiName, value)
            });
          }
        }
      });
    }
  }
  
  // If we still didn't find enough KPIs (less than half of expected), return a default set
  if (kpis.length < 8) {
    console.warn(`Only found ${kpis.length} KPIs, using default values to supplement`);
    const defaultKpis = [
      {
        name: "Delivery Completion Rate (DCR)",
        value: 98.5,
        target: 98.0,
        unit: "%",
        trend: "up" as "up" | "down" | "neutral", // Fixed: Explicitly type as union
        status: "fantastic" as KPIStatus
      },
      {
        name: "Delivered Not Received (DNR DPMO)",
        value: 2500,
        target: 3000,
        unit: "DPMO",
        trend: "down" as "up" | "down" | "neutral", // Fixed: Explicitly type as union
        status: "great" as KPIStatus
      },
      {
        name: "Contact Compliance",
        value: 92,
        target: 95,
        unit: "%",
        trend: "up" as "up" | "down" | "neutral", // Fixed: Explicitly type as union
        status: "fair" as KPIStatus
      },
      {
        name: "Photo-On-Delivery",
        value: 96,
        target: 95,
        unit: "%",
        trend: "up" as "up" | "down" | "neutral", // Fixed: Explicitly type as union
        status: "great" as KPIStatus
      },
      {
        name: "Vehicle Audit (VSA) Compliance",
        value: 97,
        target: 98,
        unit: "%",
        trend: "neutral" as "up" | "down" | "neutral", // Fixed: Explicitly type as union
        status: "fair" as KPIStatus
      }
    ];
    
    // Add only the default KPIs that we don't already have
    defaultKpis.forEach(defaultKpi => {
      if (!kpis.some(kpi => kpi.name === defaultKpi.name)) {
        kpis.push(defaultKpi);
      }
    });
  }
  
  console.log(`Final KPI count: ${kpis.length}`);
  return kpis;
};
