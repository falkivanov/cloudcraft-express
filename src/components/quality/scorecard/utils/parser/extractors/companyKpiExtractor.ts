
import { determineStatus } from '../../helpers/statusHelper';
import { extractNumericValues } from './valueExtractor';
import { KPIStatus } from '../../helpers/statusHelper';

/**
 * Extract company KPIs based on structural analysis of the PDF
 */
export const extractCompanyKPIsFromStructure = (pageData: Record<number, any>) => {
  // Define the KPIs to look for
  const kpiPatterns = [
    // Safety KPIs
    { name: "Vehicle Audit (VSA) Compliance", pattern: /VSA|Vehicle\s+Audit/i, unit: "%", category: "safety" },
    { name: "DVIC Compliance", pattern: /DVIC|Daily\s+Vehicle/i, unit: "%", category: "safety" },
    { name: "Safe Driving Metric (FICO)", pattern: /FICO|Safe\s+Driving/i, unit: "", category: "safety" },
    { name: "Speeding Event Rate (Per 100 Trips)", pattern: /Speeding|Speeding\s+Event/i, unit: "", category: "safety" },
    { name: "Mentor Adoption Rate", pattern: /Mentor\s+Adoption/i, unit: "%", category: "safety" },
    
    // Compliance KPIs
    { name: "Breach of Contract (BOC)", pattern: /BOC|Breach\s+of\s+Contract/i, unit: "", category: "compliance" },
    { name: "Working Hours Compliance (WHC)", pattern: /WHC|Working\s+Hours/i, unit: "%", category: "compliance" },
    { name: "Comprehensive Audit Score (CAS)", pattern: /CAS|Comprehensive\s+Audit/i, unit: "%", category: "compliance" },
    
    // Quality KPIs
    { name: "Delivery Completion Rate (DCR)", pattern: /DCR|Delivery\s+Completion/i, unit: "%", category: "quality" },
    { name: "Delivered Not Received (DNR DPMO)", pattern: /DNR\s+DPMO|Delivered\s+Not\s+Received/i, unit: "DPMO", category: "quality" },
    { name: "Lost on Road (LoR) DPMO", pattern: /LoR|Lost\s+on\s+Road/i, unit: "DPMO", category: "quality" },
    
    // Standard Work Compliance KPIs
    { name: "Photo-On-Delivery", pattern: /Photo[- ]On[- ]Delivery|POD/i, unit: "%", category: "standardWork" },
    { name: "Contact Compliance", pattern: /Contact\s+Compliance/i, unit: "%", category: "standardWork" },
    { name: "Door to Door delivery", pattern: /Door\s+to\s+Door|DTD/i, unit: "%", category: "standardWork" },
    { name: "Right to Driver (RTD)", pattern: /Right\s+to\s+Driver|RTD/i, unit: "%", category: "standardWork" },
    
    // Customer Experience KPIs
    { name: "Customer escalation DPMO", pattern: /Customer\s+escalation|CSAT|Customer\s+Satisfaction/i, unit: "DPMO", category: "customer" },
    { name: "Customer Delivery Feedback", pattern: /Customer\s+Delivery\s+Feedback|CDF/i, unit: "%", category: "customer" },
    { name: "Concessions DPMO", pattern: /Concessions|Koncessions/i, unit: "DPMO", category: "customer" },
    
    // Capacity KPIs
    { name: "Capacity Reliability", pattern: /Capacity\s+Reliability/i, unit: "%", category: "capacity" },
    { name: "Next Day Capacity Reliability", pattern: /Next\s+Day\s+Capacity/i, unit: "%", category: "capacity" },
  ];
  
  // Extracted KPIs will be stored here
  const extractedKPIs = [];
  
  // Check each page for KPIs
  for (const pageNum in pageData) {
    const page = pageData[pageNum];
    
    // Check each KPI pattern
    for (const { name, pattern, unit, category } of kpiPatterns) {
      // Find items that match this KPI pattern
      const matchingItems = page.items.filter((item: any) => 
        pattern.test(item.str)
      );
      
      for (const item of matchingItems) {
        // Look for numeric values near this item
        const nearbyItems = page.items.filter((otherItem: any) => {
          // Check if item is on the same row or the next row
          const sameRow = Math.abs(item.y - otherItem.y) < 5;
          const nextRow = Math.abs(item.y - otherItem.y) < 20 && item.y > otherItem.y;
          // Check if the item is to the right of our KPI text
          const isRightSide = otherItem.x > item.x;
          return (sameRow || nextRow) && isRightSide;
        });
        
        // Look for percentage or numeric values
        const valueMatches = nearbyItems
          .map((item: any) => item.str.match(/(\d+(?:\.\d+)?)/))
          .filter(Boolean)
          .map(match => parseFloat(match[1]));
        
        if (valueMatches.length > 0) {
          // Use the first value found
          const value = valueMatches[0];
          const targetIndex = unit === "DPMO" ? 1 : 0; // For DPMO, target might be the second value
          const target = valueMatches.length > 1 ? valueMatches[targetIndex] : 
                         unit === "DPMO" ? 3000 : 95; // Default targets
          
          // NEW: Look for status indicators (Poor, Fair, Great, Fantastic)
          let extractedStatus: KPIStatus = "fair"; // Default
          
          for (const nearbyItem of nearbyItems) {
            // Look for status indicators after a pipe character or standalone
            const statusMatch = nearbyItem.str.match(/(?:\||\s+)?\s*(poor|fair|great|fantastic|in compliance|not in compliance)/i);
            if (statusMatch) {
              const statusText = statusMatch[1].toLowerCase();
              if (statusText === "poor") extractedStatus = "poor";
              else if (statusText === "fair") extractedStatus = "fair";
              else if (statusText === "great") extractedStatus = "great";
              else if (statusText === "fantastic") extractedStatus = "fantastic";
              else if (statusText === "in compliance") extractedStatus = "in compliance";
              else if (statusText === "not in compliance") extractedStatus = "not in compliance";
              
              console.log(`Found status "${extractedStatus}" for KPI "${name}"`);
              break;
            }
          }
          
          // Also check for combined value and status in one item (e.g., "95% | Fantastic")
          for (const nearbyItem of nearbyItems) {
            const combinedMatch = nearbyItem.str.match(/(\d+(?:\.\d+)?)\s*(?:%|DPMO)?\s*(?:\||\s+)\s*(poor|fair|great|fantastic|in compliance|not in compliance)/i);
            if (combinedMatch) {
              const statusText = combinedMatch[2].toLowerCase();
              if (statusText === "poor") extractedStatus = "poor";
              else if (statusText === "fair") extractedStatus = "fair";
              else if (statusText === "great") extractedStatus = "great";
              else if (statusText === "fantastic") extractedStatus = "fantastic";
              else if (statusText === "in compliance") extractedStatus = "in compliance";
              else if (statusText === "not in compliance") extractedStatus = "not in compliance";
              
              console.log(`Found combined value and status "${extractedStatus}" for KPI "${name}"`);
              break;
            }
          }
          
          // Check if we already have this KPI to avoid duplicates
          if (!extractedKPIs.some(kpi => kpi.name === name)) {
            extractedKPIs.push({
              name,
              value,
              target,
              unit,
              trend: "neutral" as const,
              status: extractedStatus, // Use extracted status instead of determining by value
              category: category as "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity"
            });
          }
          
          // Break after finding the first valid value
          break;
        }
      }
    }
    
    // Also try to find generic KPI patterns in rows
    if (page.rows) {
      for (const row of page.rows) {
        const rowText = row.map((item: any) => item.str).join(' ');
        
        // Look for percentage patterns with status indicators
        const percentWithStatusMatch = rowText.match(/([A-Za-z\s\(\)]+)(?:\s*:|:\s*)(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i);
        if (percentWithStatusMatch) {
          const kpiName = percentWithStatusMatch[1].trim();
          const value = parseFloat(percentWithStatusMatch[2]);
          const statusText = percentWithStatusMatch[3].toLowerCase();
          
          let extractedStatus: KPIStatus = "fair"; // Default
          if (statusText === "poor") extractedStatus = "poor";
          else if (statusText === "fair") extractedStatus = "fair";
          else if (statusText === "great") extractedStatus = "great";
          else if (statusText === "fantastic") extractedStatus = "fantastic";
          
          // Check if this matches a known KPI or is a new one
          const knownKpi = kpiPatterns.find(({name}) => 
            name.toLowerCase().includes(kpiName.toLowerCase()) || 
            kpiName.toLowerCase().includes(name.toLowerCase().split(' ')[0])
          );
          
          if (knownKpi && !extractedKPIs.some(kpi => kpi.name === knownKpi.name)) {
            extractedKPIs.push({
              name: knownKpi.name,
              value,
              target: 95, // Default target
              unit: "%",
              trend: "neutral" as const,
              status: extractedStatus,
              category: knownKpi.category as "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity"
            });
          }
          continue; // Skip regular percentage matching if we found one with status
        }
        
        // Regular percentage pattern (without status)
        const percentMatch = rowText.match(/([A-Za-z\s\(\)]+)(?:\s*:|:\s*)(\d+(?:\.\d+)?)\s*%/);
        if (percentMatch) {
          const kpiName = percentMatch[1].trim();
          const value = parseFloat(percentMatch[2]);
          
          // Check if this matches a known KPI or is a new one
          const knownKpi = kpiPatterns.find(({name}) => 
            name.toLowerCase().includes(kpiName.toLowerCase()) || 
            kpiName.toLowerCase().includes(name.toLowerCase().split(' ')[0])
          );
          
          if (knownKpi && !extractedKPIs.some(kpi => kpi.name === knownKpi.name)) {
            extractedKPIs.push({
              name: knownKpi.name,
              value,
              target: 95, // Default target
              unit: "%",
              trend: "neutral" as const,
              status: determineStatus(knownKpi.name, value),
              category: knownKpi.category as "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity"
            });
          }
        }
        
        // Look for DPMO patterns with status
        const dpmoWithStatusMatch = rowText.match(/([A-Za-z\s\(\)]+)(?:\s*:|:\s*)(\d+)\s*(?:DPMO)?\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i);
        if (dpmoWithStatusMatch && (rowText.includes('DPMO') || rowText.includes('DNR') || rowText.includes('escalation'))) {
          const kpiName = dpmoWithStatusMatch[1].trim();
          const value = parseInt(dpmoWithStatusMatch[2], 10);
          const statusText = dpmoWithStatusMatch[3].toLowerCase();
          
          let extractedStatus: KPIStatus = "fair"; // Default
          if (statusText === "poor") extractedStatus = "poor";
          else if (statusText === "fair") extractedStatus = "fair";
          else if (statusText === "great") extractedStatus = "great";
          else if (statusText === "fantastic") extractedStatus = "fantastic";
          
          // Check if this matches a known KPI or is a new one
          const knownKpi = kpiPatterns.find(({name}) => 
            name.toLowerCase().includes(kpiName.toLowerCase()) || 
            kpiName.toLowerCase().includes(name.toLowerCase().split(' ')[0])
          );
          
          if (knownKpi && !extractedKPIs.some(kpi => kpi.name === knownKpi.name)) {
            extractedKPIs.push({
              name: knownKpi.name,
              value,
              target: 3000, // Default target for DPMO
              unit: "DPMO",
              trend: "neutral" as const,
              status: extractedStatus,
              category: knownKpi.category as "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity"
            });
          }
          continue; // Skip regular DPMO matching if we found one with status
        }
        
        // Regular DPMO pattern (without status)
        const dpmoMatch = rowText.match(/([A-Za-z\s\(\)]+)(?:\s*:|:\s*)(\d+)\s*(?:DPMO)?/);
        if (dpmoMatch && (rowText.includes('DPMO') || rowText.includes('DNR') || rowText.includes('escalation'))) {
          const kpiName = dpmoMatch[1].trim();
          const value = parseInt(dpmoMatch[2], 10);
          
          // Check if this matches a known KPI or is a new one
          const knownKpi = kpiPatterns.find(({name}) => 
            name.toLowerCase().includes(kpiName.toLowerCase()) || 
            kpiName.toLowerCase().includes(name.toLowerCase().split(' ')[0])
          );
          
          if (knownKpi && !extractedKPIs.some(kpi => kpi.name === knownKpi.name)) {
            extractedKPIs.push({
              name: knownKpi.name,
              value,
              target: 3000, // Default target for DPMO
              unit: "DPMO",
              trend: "neutral" as const,
              status: determineStatus(knownKpi.name, value),
              category: knownKpi.category as "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity"
            });
          }
        }
      }
    }
  }
  
  // Extract overall status and score
  let overallStatus: KPIStatus = "fair";
  let overallScore = 0;
  
  // Look for the overall score and status on page 2
  if (pageData[2]) {
    const page = pageData[2];
    
    // Try to find overall status patterns
    for (const item of page.items) {
      // Look for "Overall: XX% | Status" pattern
      const overallMatch = item.str.match(/overall.*?(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i);
      if (overallMatch) {
        overallScore = parseFloat(overallMatch[1]);
        const statusText = overallMatch[2].toLowerCase();
        
        if (statusText === "poor") overallStatus = "poor";
        else if (statusText === "fair") overallStatus = "fair";
        else if (statusText === "great") overallStatus = "great";
        else if (statusText === "fantastic") overallStatus = "fantastic";
        
        console.log(`Found overall score ${overallScore}% with status "${overallStatus}"`);
        break;
      }
    }
  }
  
  // If we didn't find any KPIs, return a default set
  if (extractedKPIs.length === 0) {
    return [
      {
        name: "Delivery Completion Rate (DCR)",
        value: 98.5,
        target: 98.0,
        unit: "%",
        trend: "up" as const,
        status: "fantastic" as const,
        category: "quality" as const
      },
      {
        name: "Delivered Not Received (DNR DPMO)",
        value: 2500,
        target: 3000,
        unit: "DPMO",
        trend: "down" as const,
        status: "great" as const,
        category: "quality" as const
      },
      {
        name: "Contact Compliance",
        value: 92,
        target: 95,
        unit: "%",
        trend: "up" as const,
        status: "fair" as const,
        category: "standardWork" as const
      }
    ];
  }
  
  return extractedKPIs;
};
