
import { ScoreCardData } from "../../types";
import { KPIStatus, determineStatus } from "../helpers/statusHelper";
import { extractWeekFromFilename } from "./weekUtils";

/**
 * Create a simple scorecard with basic data
 * @param weekNum The week number for the scorecard
 * @returns A simple ScoreCardData object
 */
export const createSimpleScorecard = (weekNum: number): ScoreCardData => {
  const currentYear = new Date().getFullYear();
  
  return {
    week: weekNum,
    year: currentYear,
    location: 'DSU1',
    overallScore: 85,
    overallStatus: 'Great',
    rank: 5,
    rankNote: 'Up 2 places from last week',
    companyKPIs: [
      {
        name: 'Delivery Completion Rate (DCR)',
        value: 98.5,
        target: 98.0,
        unit: '%',
        trend: 'up',
        status: 'fantastic' as KPIStatus
      },
      {
        name: 'Delivered Not Received (DNR DPMO)',
        value: 2500,
        target: 3000,
        unit: 'DPMO',
        trend: 'down',
        status: 'great' as KPIStatus
      },
      {
        name: 'Contact Compliance',
        value: 92,
        target: 95,
        unit: '%',
        trend: 'up',
        status: 'fair' as KPIStatus
      }
    ],
    driverKPIs: [
      {
        name: 'TR-001',
        status: 'active',
        metrics: [
          { name: 'Delivered', value: 98, target: 100, unit: '%', status: 'great' as KPIStatus },
          { name: 'DNR DPMO', value: 2500, target: 3000, unit: 'DPMO', status: 'great' as KPIStatus },
          { name: 'Contact Compliance', value: 92, target: 95, unit: '%', status: 'fair' as KPIStatus }
        ]
      },
      {
        name: 'TR-002',
        status: 'active',
        metrics: [
          { name: 'Delivered', value: 99, target: 100, unit: '%', status: 'fantastic' as KPIStatus },
          { name: 'DNR DPMO', value: 2000, target: 3000, unit: 'DPMO', status: 'fantastic' as KPIStatus },
          { name: 'Contact Compliance', value: 96, target: 95, unit: '%', status: 'fantastic' as KPIStatus }
        ]
      }
    ],
    recommendedFocusAreas: ['Contact Compliance', 'DNR DPMO'],
  };
};

/**
 * Extract scorecard data from a PDF based on structural analysis
 * @param pageData Object containing extracted page data with positions
 * @param filename The PDF filename for week extraction
 * @returns Structured ScoreCardData based on positional analysis
 */
export const extractStructuredScorecard = (pageData: Record<number, any>, filename: string): ScoreCardData => {
  const weekNum = extractWeekFromFilename(filename);
  const currentYear = new Date().getFullYear();
  
  // Extract possible location from title or header (usually on page 1)
  const locationPattern = /DS[A-Z]\d+|[A-Z]{3}\d+/g;
  const locationMatches = pageData[1]?.text.match(locationPattern);
  const location = locationMatches ? locationMatches[0] : 'DSU1';
  
  // Extract overall score (usually a prominent number on page 1)
  const scoreMatches = pageData[1]?.text.match(/(\d{2,3})(\s*%|\s*points|\s*score)/i);
  const overallScore = scoreMatches ? parseInt(scoreMatches[1], 10) : 85;
  
  // Determine status based on score
  let overallStatus = 'Fair';
  if (overallScore >= 95) overallStatus = 'Fantastic';
  else if (overallScore >= 85) overallStatus = 'Great';
  else if (overallScore < 75) overallStatus = 'Poor';
  
  // Extract rank information
  const rankMatches = pageData[1]?.text.match(/rank\D*(\d+)/i);
  const rank = rankMatches ? parseInt(rankMatches[1], 10) : 5;
  
  // Try to find rank change information
  let rankNote = '';
  if (pageData[1]?.text.match(/up\s+(\d+)/i)) {
    const upMatch = pageData[1]?.text.match(/up\s+(\d+)/i);
    rankNote = upMatch ? `Up ${upMatch[1]} places from last week` : '';
  } else if (pageData[1]?.text.match(/down\s+(\d+)/i)) {
    const downMatch = pageData[1]?.text.match(/down\s+(\d+)/i);
    rankNote = downMatch ? `Down ${downMatch[1]} places from last week` : '';
  }
  
  // Extract company KPIs by looking for specific patterns across all pages
  const companyKPIs = extractCompanyKPIsFromStructure(pageData);
  
  // Extract driver KPIs from typically page 2 or 3
  const driverKPIs = extractDriverKPIsFromStructure(pageData);
  
  // Extract focus areas - usually found in a specific section
  const focusAreas = extractFocusAreasFromStructure(pageData);
  
  return {
    week: weekNum,
    year: currentYear,
    location,
    overallScore,
    overallStatus,
    rank,
    rankNote,
    companyKPIs,
    driverKPIs,
    recommendedFocusAreas: focusAreas.length > 0 ? focusAreas : ['Contact Compliance', 'DNR DPMO'],
  };
};

/**
 * Extract company KPIs based on structural analysis of the PDF
 */
const extractCompanyKPIsFromStructure = (pageData: Record<number, any>) => {
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
  
  return extractedKPIs;
};

/**
 * Extract driver KPIs from structural analysis of the PDF
 */
const extractDriverKPIsFromStructure = (pageData: Record<number, any>) => {
  // We'll focus on pages 2 and 3 which typically contain driver data
  const relevantPages = [2, 3].filter(num => pageData[num]);
  const drivers = [];
  
  // Look for driver patterns in relevant pages
  for (const pageNum of relevantPages) {
    const page = pageData[pageNum];
    
    // Group items by rows based on y-coordinate
    const rows: any[][] = [];
    let currentRow: any[] = [];
    let lastY = -1;
    
    // Sort items by y-coordinate (top to bottom)
    const sortedItems = [...page.items].sort((a, b) => b.y - a.y);
    
    // Group into rows
    for (const item of sortedItems) {
      if (lastY === -1 || Math.abs(item.y - lastY) < 5) {
        // Same row
        currentRow.push(item);
      } else {
        // New row
        if (currentRow.length > 0) {
          rows.push([...currentRow].sort((a, b) => a.x - b.x)); // Sort by x within row
          currentRow = [item];
        } else {
          currentRow = [item];
        }
      }
      lastY = item.y;
    }
    if (currentRow.length > 0) {
      rows.push([...currentRow].sort((a, b) => a.x - b.x));
    }
    
    // Look for driver patterns in rows
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowText = row.map(item => item.str).join(' ');
      
      // Check for driver identifier patterns (TR-XXX or names)
      const driverMatch = rowText.match(/TR[-\s]?\d+|[A-Z][a-z]+\s+[A-Z][a-z]+/);
      if (driverMatch) {
        const driverName = driverMatch[0];
        
        // Look for metrics in this row and next rows
        const metrics = [];
        const metricsToFind = ["Delivered", "DNR DPMO", "Contact Compliance"];
        
        // Check current row for metrics
        const currentRowValues = extractNumericValues(rowText);
        
        // Also check the next row for more metrics
        let nextRowValues = [];
        if (i + 1 < rows.length) {
          const nextRowText = rows[i + 1].map(item => item.str).join(' ');
          nextRowValues = extractNumericValues(nextRowText);
        }
        
        // Combine values from current and next row
        const allValues = [...currentRowValues, ...nextRowValues];
        
        // Map values to metrics
        if (allValues.length > 0) {
          for (let j = 0; j < Math.min(metricsToFind.length, allValues.length); j++) {
            const metricName = metricsToFind[j];
            const value = allValues[j];
            
            // Determine unit based on metric name
            const unit = metricName.includes("DPMO") ? "DPMO" : "%";
            
            // Set default target based on metric
            const target = metricName.includes("DPMO") ? 3000 : 
                         metricName === "Delivered" ? 100 : 95;
            
            metrics.push({
              name: metricName,
              value,
              target,
              unit,
              status: determineStatus(metricName, value)
            });
          }
          
          // Only add driver if we found some metrics
          if (metrics.length > 0) {
            drivers.push({
              name: driverName,
              status: "active",
              metrics
            });
          }
        }
      }
    }
  }
  
  // If we didn't find any drivers, return default data
  if (drivers.length === 0) {
    return [
      {
        name: "TR-001",
        status: "active",
        metrics: [
          { name: "Delivered", value: 98, target: 100, unit: "%", status: "great" as KPIStatus },
          { name: "DNR DPMO", value: 2500, target: 3000, unit: "DPMO", status: "great" as KPIStatus },
          { name: "Contact Compliance", value: 92, target: 95, unit: "%", status: "fair" as KPIStatus }
        ]
      },
      {
        name: "TR-002",
        status: "active",
        metrics: [
          { name: "Delivered", value: 99, target: 100, unit: "%", status: "fantastic" as KPIStatus },
          { name: "DNR DPMO", value: 2000, target: 3000, unit: "DPMO", status: "fantastic" as KPIStatus },
          { name: "Contact Compliance", value: 96, target: 95, unit: "%", status: "fantastic" as KPIStatus }
        ]
      }
    ];
  }
  
  return drivers;
};

/**
 * Extract focus areas from PDF content
 */
const extractFocusAreasFromStructure = (pageData: Record<number, any>) => {
  // Focus areas are typically on page 1 or 2
  const relevantPages = [1, 2].filter(num => pageData[num]);
  
  for (const pageNum of relevantPages) {
    const page = pageData[pageNum];
    
    // Look for sections that might contain focus areas
    const focusItems = page.items.filter((item: any) => 
      /focus\s+areas?|improvement|bereich/i.test(item.str)
    );
    
    for (const focusItem of focusItems) {
      // Get items below the focus area header
      const belowItems = page.items.filter((item: any) => 
        item.y < focusItem.y && item.y > focusItem.y - 100
      );
      
      // Concatenate text from below items
      const belowText = belowItems.map((item: any) => item.str).join(' ');
      
      // Extract potential focus areas by looking for capitalized words or bullet points
      const potentialAreas = belowText.split(/[•\-,\n]/)
        .map(area => area.trim())
        .filter(area => area.length > 0 && /^[A-Z]/.test(area));
      
      if (potentialAreas.length > 0) {
        return potentialAreas;
      }
    }
  }
  
  return [];
};

/**
 * Extract numeric values from text
 */
const extractNumericValues = (text: string): number[] => {
  const matches = text.match(/\b\d+(?:\.\d+)?\b/g);
  return matches ? matches.map(m => parseFloat(m)) : [];
};
