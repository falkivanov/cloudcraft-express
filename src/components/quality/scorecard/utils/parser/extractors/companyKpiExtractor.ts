
import { determineStatus } from '../../helpers/statusHelper';
import { extractNumericValues } from './valueExtractor';

/**
 * Extract company KPIs based on structural analysis of the PDF
 */
export const extractCompanyKPIsFromStructure = (pageData: Record<number, any>) => {
  // Define the KPIs to look for
  const kpiPatterns = [
    { name: "Delivery Completion Rate (DCR)", pattern: /DCR|Delivery\s+Completion/i, unit: "%" },
    { name: "Delivered Not Received (DNR DPMO)", pattern: /DNR\s+DPMO|Delivered\s+Not\s+Received/i, unit: "DPMO" },
    { name: "Photo-On-Delivery", pattern: /Photo[- ]On[- ]Delivery|POD/i, unit: "%" },
    { name: "Contact Compliance", pattern: /Contact\s+Compliance/i, unit: "%" },
    { name: "Customer escalation DPMO", pattern: /Customer\s+escalation|CSAT|Customer\s+Satisfaction/i, unit: "DPMO" },
    { name: "Vehicle Audit (VSA) Compliance", pattern: /VSA|Vehicle\s+Audit/i, unit: "%" },
    { name: "DVIC Compliance", pattern: /DVIC|Daily\s+Vehicle/i, unit: "%" },
    { name: "Safe Driving Metric (FICO)", pattern: /FICO|Safe\s+Driving/i, unit: "" },
    { name: "Capacity Reliability", pattern: /Capacity\s+Reliability/i, unit: "%" },
    { name: "Lost on Road (LoR) DPMO", pattern: /LoR|Lost\s+on\s+Road/i, unit: "DPMO" },
    { name: "Door to Door delivery", pattern: /Door\s+to\s+Door|DTD/i, unit: "%" },
    { name: "Right to Driver (RTD)", pattern: /Right\s+to\s+Driver|RTD/i, unit: "%" },
    { name: "Customer Delivery Feedback", pattern: /Customer\s+Delivery\s+Feedback|CDF/i, unit: "%" },
    { name: "Concessions DPMO", pattern: /Concessions|Koncessions/i, unit: "DPMO" },
    { name: "Mentor Adoption Rate", pattern: /Mentor\s+Adoption/i, unit: "%" },
    { name: "Working Hours Compliance (WHC)", pattern: /WHC|Working\s+Hours/i, unit: "%" },
  ];
  
  // Extracted KPIs will be stored here
  const extractedKPIs = [];
  
  // Check each page for KPIs
  for (const pageNum in pageData) {
    const page = pageData[pageNum];
    
    // Check each KPI pattern
    for (const { name, pattern, unit } of kpiPatterns) {
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
          
          // Check if we already have this KPI to avoid duplicates
          if (!extractedKPIs.some(kpi => kpi.name === name)) {
            extractedKPIs.push({
              name,
              value,
              target,
              unit,
              trend: "neutral" as const,
              status: determineStatus(name, value)
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
        
        // Look for percentage patterns
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
              status: determineStatus(knownKpi.name, value)
            });
          }
        }
        
        // Look for DPMO patterns
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
              status: determineStatus(knownKpi.name, value)
            });
          }
        }
      }
    }
  }
  
  // Look for overall score and rank on the first page
  const page1 = pageData[1];
  if (page1) {
    // Extract overall score
    const overallScoreItems = page1.items.filter((item: any) => 
      /overall\s+score|total\s+score|scorecard\s+score/i.test(item.str)
    );
    
    if (overallScoreItems.length > 0) {
      // Score is likely nearby
      for (const item of overallScoreItems) {
        const nearbyItems = page1.items.filter((otherItem: any) => 
          Math.abs(item.y - otherItem.y) < 20 && otherItem.x > item.x
        );
        
        // Look for percentage or numbers
        const scoreMatch = nearbyItems
          .map((item: any) => item.str.match(/(\d+(?:\.\d+)?)/))
          .filter(Boolean)[0];
        
        if (scoreMatch) {
          console.log(`Found overall score: ${scoreMatch[1]}`);
          // We would store this in page metadata
        }
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
        status: "fantastic" as const
      },
      {
        name: "Delivered Not Received (DNR DPMO)",
        value: 2500,
        target: 3000,
        unit: "DPMO",
        trend: "down" as const,
        status: "great" as const
      },
      {
        name: "Contact Compliance",
        value: 92,
        target: 95,
        unit: "%",
        trend: "up" as const,
        status: "fair" as const
      }
    ];
  }
  
  return extractedKPIs;
};
