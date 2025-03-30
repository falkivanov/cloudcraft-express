
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
    // Safety KPIs
    { name: "Vehicle Audit (VSA) Compliance", pattern: /(?:VSA|Vehicle\s+Audit|Vehicle\s+Safety\s+Audit)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "safety" },
    { name: "DVIC Compliance", pattern: /(?:DVIC|Daily\s+Vehicle\s+Inspection)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "safety" },
    { name: "Safe Driving Metric (FICO)", pattern: /(?:FICO|Safe\s+Driving)[:\s]+(\d+(?:\.\d+)?)/i, unit: "", category: "safety" },
    { name: "Speeding Event Rate (Per 100 Trips)", pattern: /(?:Speeding|Speeding\s+Event)[:\s]+(\d+(?:\.\d+)?)/i, unit: "", category: "safety" },
    { name: "Mentor Adoption Rate", pattern: /(?:Mentor\s+Adoption)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "safety" },
    
    // Compliance KPIs
    { name: "Breach of Contract (BOC)", pattern: /(?:BOC|Breach\s+of\s+Contract)[:\s]+(\d+(?:\.\d+)?)/i, unit: "", category: "compliance" },
    { name: "Working Hours Compliance (WHC)", pattern: /(?:WHC|Working\s+Hours)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "compliance" },
    { name: "Comprehensive Audit Score (CAS)", pattern: /(?:CAS|Comprehensive\s+Audit)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "compliance" },
    
    // Quality KPIs
    { name: "Delivery Completion Rate (DCR)", pattern: /(?:DCR|Delivery\s+Completion\s+Rate)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "quality" },
    { name: "Delivered Not Received (DNR DPMO)", pattern: /(?:DNR|Delivered\s+Not\s+Received)(?:\s+DPMO)?[:\s]+(\d+(?:\.\d+)?)/i, unit: "DPMO", category: "quality" },
    { name: "Lost on Road (LoR) DPMO", pattern: /(?:LoR|Lost\s+on\s+Road)(?:\s+DPMO)?[:\s]+(\d+(?:\.\d+)?)/i, unit: "DPMO", category: "quality" },
    
    // Standard Work Compliance
    { name: "Photo-On-Delivery", pattern: /(?:Photo[- ]On[- ]Delivery|POD)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "standardWork" },
    { name: "Contact Compliance", pattern: /Contact\s+Compliance[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "standardWork" },
    { name: "Door to Door delivery", pattern: /(?:Door\s+to\s+Door|DTD)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "standardWork" },
    { name: "Right to Driver (RTD)", pattern: /(?:Right\s+to\s+Driver|RTD)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "standardWork" },
    
    // Customer Experience KPIs
    { name: "Customer escalation DPMO", pattern: /(?:Customer\s+escalation|CSAT|Customer\s+Satisfaction)(?:\s+DPMO)?[:\s]+(\d+(?:\.\d+)?)/i, unit: "DPMO", category: "customer" },
    { name: "Customer Delivery Feedback", pattern: /(?:Customer\s+Delivery\s+Feedback|CDF)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "customer" },
    { name: "Concessions DPMO", pattern: /(?:Concessions|Koncessions)(?:\s+DPMO)?[:\s]+(\d+(?:\.\d+)?)/i, unit: "DPMO", category: "customer" },
    
    // Capacity KPIs
    { name: "Capacity Reliability", pattern: /Capacity\s+Reliability[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "capacity" },
    { name: "Next Day Capacity Reliability", pattern: /Next\s+Day\s+Capacity[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "capacity" }
  ];
  
  console.log("Extracting company KPIs from scorecard text, page 2");
  
  // Check each pattern against the text
  kpiPatterns.forEach(({ name, pattern, unit, category }) => {
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
        status: determineStatus(name, value),
        category: category as "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity"
      });
    }
  });
  
  // Generic KPI extractor for page 2
  // This approach looks for structured data in KPI form - generally patterns like "Name: 98.5%"
  
  // First try to find patterns with percentages
  const percentagePatterns = text.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-)(?:\s*)(\d+(?:\.\d+)?)\s*%/g);
  if (percentagePatterns) {
    percentagePatterns.forEach(match => {
      const parts = match.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-)(?:\s*)(\d+(?:\.\d+)?)\s*%/);
      if (parts && parts.length >= 3) {
        const kpiName = parts[1].trim();
        const value = parseFloat(parts[2]);
        
        // Skip if already exists
        if (!kpis.some(k => k.name.toLowerCase() === kpiName.toLowerCase())) {
          console.log(`Found generic percentage KPI: ${kpiName} = ${value}%`);
          
          // Try to determine category based on the KPI name
          let category: "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity" | undefined;
          
          if (kpiName.toLowerCase().includes('safe') || kpiName.toLowerCase().includes('fico') || 
              kpiName.toLowerCase().includes('speeding') || kpiName.toLowerCase().includes('mentor')) {
            category = "safety";
          } else if (kpiName.toLowerCase().includes('compliance') || kpiName.toLowerCase().includes('audit') || 
                     kpiName.toLowerCase().includes('boc') || kpiName.toLowerCase().includes('whc')) {
            category = "compliance";
          } else if (kpiName.toLowerCase().includes('customer') || kpiName.toLowerCase().includes('escalation') || 
                     kpiName.toLowerCase().includes('feedback')) {
            category = "customer";
          } else if (kpiName.toLowerCase().includes('photo') || kpiName.toLowerCase().includes('contact') || 
                     kpiName.toLowerCase().includes('pod')) {
            category = "standardWork";
          } else if (kpiName.toLowerCase().includes('dcr') || kpiName.toLowerCase().includes('dnr') || 
                     kpiName.toLowerCase().includes('lor')) {
            category = "quality";
          } else if (kpiName.toLowerCase().includes('capacity') || kpiName.toLowerCase().includes('reliability')) {
            category = "capacity";
          }
          
          kpis.push({
            name: kpiName,
            value,
            target: 95, // Default target for percentage metrics
            unit: "%",
            trend: "neutral" as "up" | "down" | "neutral",
            status: determineStatus(kpiName, value),
            category
          });
        }
      }
    });
  }
  
  // Look for DPMO patterns
  const dpmoPatterns = text.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-)(?:\s*)(\d+(?:\.\d+)?)\s*(?:DPMO)?/g);
  if (dpmoPatterns) {
    dpmoPatterns.forEach(match => {
      // Only process if it contains 'DPMO' or is a known DPMO metric
      if (match.includes('DPMO') || match.includes('DNR') || match.includes('LoR') || match.includes('Concession')) {
        const parts = match.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-)(?:\s*)(\d+(?:\.\d+)?)/);
        if (parts && parts.length >= 3) {
          const kpiName = parts[1].trim();
          const value = parseFloat(parts[2]);
          
          // Skip if already exists
          if (!kpis.some(k => k.name.toLowerCase() === kpiName.toLowerCase())) {
            console.log(`Found generic DPMO KPI: ${kpiName} = ${value}`);
            
            // Try to determine category based on the KPI name
            let category: "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity" | undefined;
            
            if (kpiName.toLowerCase().includes('customer') || kpiName.toLowerCase().includes('escalation')) {
              category = "customer";
            } else if (kpiName.toLowerCase().includes('dnr') || kpiName.toLowerCase().includes('lor')) {
              category = "quality";
            }
            
            kpis.push({
              name: kpiName,
              value,
              target: 3000, // Default target for DPMO metrics
              unit: "DPMO",
              trend: "neutral" as "up" | "down" | "neutral",
              status: determineStatus(kpiName, value),
              category
            });
          }
        }
      }
    });
  }
  
  // Look for KPIs with numeric values but no units (like FICO)
  const numericPatterns = text.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-)(?:\s*)(\d+(?:\.\d+)?)\s*(?![%DPMO])/g);
  if (numericPatterns) {
    numericPatterns.forEach(match => {
      const parts = match.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-)(?:\s*)(\d+(?:\.\d+)?)/);
      if (parts && parts.length >= 3) {
        const kpiName = parts[1].trim();
        const value = parseFloat(parts[2]);
        
        // Skip if already exists
        if (!kpis.some(k => k.name.toLowerCase() === kpiName.toLowerCase())) {
          // Only add if it's likely a KPI (not just any number)
          if (kpiName.length > 3 && !kpiName.includes('Week') && !kpiName.includes('Date')) {
            console.log(`Found generic numeric KPI: ${kpiName} = ${value}`);
            
            // Try to determine category based on the KPI name
            let category: "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity" | undefined;
            
            if (kpiName.toLowerCase().includes('fico') || kpiName.toLowerCase().includes('safe driving')) {
              category = "safety";
            } else if (kpiName.toLowerCase().includes('breach') || kpiName.toLowerCase().includes('boc')) {
              category = "compliance";
            }
            
            kpis.push({
              name: kpiName,
              value,
              target: kpiName.includes('FICO') ? 800 : 100, // Default targets
              unit: "",
              trend: "neutral" as "up" | "down" | "neutral",
              status: determineStatus(kpiName, value),
              category
            });
          }
        }
      }
    });
  }
  
  // Post-process KPIs to deduplicate and handle common variations
  const processedKpis: ScorecardKPI[] = [];
  const processedNames = new Set<string>();
  
  // First pass: normalize and deduplicate
  kpis.forEach(kpi => {
    // Normalize name for comparison (remove extra whitespace, lowercase)
    const normalizedName = kpi.name.replace(/\s+/g, ' ').toLowerCase();
    
    // Skip if we've already added this KPI (by normalized name)
    if (!processedNames.has(normalizedName)) {
      processedNames.add(normalizedName);
      processedKpis.push(kpi);
    }
  });
  
  // Categorize any remaining uncategorized KPIs
  processedKpis.forEach(kpi => {
    if (!kpi.category) {
      // Try to assign a category based on the KPI name
      if (kpi.name.toLowerCase().includes('safe') || kpi.name.toLowerCase().includes('speeding') || 
          kpi.name.toLowerCase().includes('mentor') || kpi.name.toLowerCase().includes('fico')) {
        kpi.category = "safety";
      } else if (kpi.name.toLowerCase().includes('compliance') || kpi.name.toLowerCase().includes('audit') || 
                 kpi.name.toLowerCase().includes('breach') || kpi.name.toLowerCase().includes('contract')) {
        kpi.category = "compliance";
      } else if (kpi.name.toLowerCase().includes('customer') || kpi.name.toLowerCase().includes('escalation') || 
                 kpi.name.toLowerCase().includes('feedback')) {
        kpi.category = "customer";
      } else if (kpi.name.toLowerCase().includes('photo') || kpi.name.toLowerCase().includes('contact') || 
                 kpi.name.toLowerCase().includes('pod')) {
        kpi.category = "standardWork";
      } else if (kpi.name.toLowerCase().includes('dcr') || kpi.name.toLowerCase().includes('dnr') || 
                 kpi.name.toLowerCase().includes('lor') || kpi.name.toLowerCase().includes('delivery completion')) {
        kpi.category = "quality";
      } else if (kpi.name.toLowerCase().includes('capacity') || kpi.name.toLowerCase().includes('reliability')) {
        kpi.category = "capacity";
      }
    }
  });
  
  console.log(`Final KPI count: ${processedKpis.length}`);
  return processedKpis;
};
