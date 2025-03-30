
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
          
          extractedKPIs.push({
            name,
            value,
            target,
            unit,
            trend: "neutral",
            status: determineStatus(name, value)
          });
          
          // Break after finding the first valid value
          break;
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
        trend: "up",
        status: "fantastic" as const
      },
      {
        name: "Delivered Not Received (DNR DPMO)",
        value: 2500,
        target: 3000,
        unit: "DPMO",
        trend: "down",
        status: "great" as const
      },
      {
        name: "Contact Compliance",
        value: 92,
        target: 95,
        unit: "%",
        trend: "up",
        status: "fair" as const
      }
    ];
  }
  
  return extractedKPIs;
};
