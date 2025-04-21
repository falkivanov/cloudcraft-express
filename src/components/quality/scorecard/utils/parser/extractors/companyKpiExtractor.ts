
import { determineStatus, getDefaultTargetForKPI, KPIStatus } from '../../helpers/statusHelper';
import { extractNumericValues } from './valueExtractor';

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
    { name: "Breach of Contract (BOC)", pattern: /BOC|Breach\s+of\s+Contract/i, unit: "", category: "compliance", specialStatusOnly: true },
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
  
  // Debug flag for detailed logging
  const DEBUG_EXTRACTION = true;
  
  // Extracted KPIs will be stored here
  const extractedKPIs = [];
  
  // Check each page for KPIs
  for (const pageNum in pageData) {
    const page = pageData[pageNum];
    if (!page || !page.items || page.items.length === 0) {
      if (DEBUG_EXTRACTION) console.log(`Page ${pageNum} has no items to process`);
      continue;
    }
    
    if (DEBUG_EXTRACTION) console.log(`Processing page ${pageNum} with ${page.items.length} items for company KPIs`);
    
    // Main content typically appears on pages 2 and 3
    if (parseInt(pageNum) > 5) continue; // Skip non-relevant pages
    
    // Check each KPI pattern
    for (const { name, pattern, unit, category, specialStatusOnly } of kpiPatterns) {
      // Find items that match this KPI pattern
      const matchingItems = page.items.filter((item: any) => 
        pattern.test(item.str)
      );
      
      if (DEBUG_EXTRACTION && matchingItems.length > 0) {
        console.log(`Found ${matchingItems.length} matches for KPI pattern: ${name}`);
      }
      
      for (const item of matchingItems) {
        if (DEBUG_EXTRACTION) console.log(`Processing KPI match: ${name} (${item.str})`);
        
        // Special case for BOC which only has status and no value
        if (specialStatusOnly && name === "Breach of Contract (BOC)") {
          if (DEBUG_EXTRACTION) console.log("Processing special BOC case that only uses status...");
          
          // Look for items near this item
          const nearbyItems = page.items.filter((otherItem: any) => {
            // Check if item is on the same row or the next rows
            const sameOrNextRows = Math.abs(item.y - otherItem.y) < 30;
            // Check if the item is to the right of our KPI text
            const isRightSide = otherItem.x > item.x;
            return sameOrNextRows && isRightSide;
          });
          
          // Look specifically for "none" or "not in compliance"
          let bocStatus: KPIStatus = "none"; // Default is "none" (good)
          
          for (const nearbyItem of nearbyItems) {
            const bocStatusMatch = nearbyItem.str.match(/(none|not\s+in\s+compliance|in\s+compliance)/i);
            if (bocStatusMatch) {
              const statusText = bocStatusMatch[1].toLowerCase();
              if (statusText === "not in compliance") {
                bocStatus = "not in compliance";
                console.log("Found BOC with status: not in compliance");
              } else if (statusText === "in compliance" || statusText === "none") {
                bocStatus = "none";
                console.log("Found BOC with status: none/in compliance");
              }
              break;
            }
          }
          
          // If we can't find explicit status, look for any indicators
          if (bocStatus === "none") {
            for (const nearbyItem of nearbyItems) {
              // Look for numeric values - if any value > 0 is found, it's "not in compliance"
              const valueMatch = nearbyItem.str.match(/(\d+)/);
              if (valueMatch && parseInt(valueMatch[1]) > 0) {
                bocStatus = "not in compliance";
                console.log("Found BOC with value > 0, setting to not in compliance");
                break;
              }
              
              // Also look for color indicators or other words that might indicate status
              if (nearbyItem.str.toLowerCase().includes("red") || 
                  nearbyItem.str.toLowerCase().includes("fail") || 
                  nearbyItem.str.toLowerCase().includes("poor")) {
                bocStatus = "not in compliance";
                console.log("Found BOC with indicator suggesting not in compliance");
                break;
              }
            }
          }
          
          // Add BOC with status but zero value
          if (!extractedKPIs.some(kpi => kpi.name === name)) {
            extractedKPIs.push({
              name,
              value: 0, // BOC has no numeric value, using 0
              target: 0, // Target is always 0 breaches
              unit,
              trend: "neutral" as const,
              status: bocStatus,
              category: category as "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity"
            });
            
            if (DEBUG_EXTRACTION) console.log(`Added BOC KPI with status: ${bocStatus}`);
          }
          
          // Skip the regular value extraction for BOC
          continue;
        }
        
        // Enhanced KPI extraction with wider search area
        const MAX_X_DISTANCE = 300; // Maximum horizontal distance to look for values
        const MAX_Y_DISTANCE = 40;  // Maximum vertical distance to look for related values
        
        // Look for numeric values near this item with wider range
        const nearbyItems = page.items.filter((otherItem: any) => {
          // Check if item is within reasonable distance
          const closeHorizontally = otherItem.x > item.x && (otherItem.x - item.x) < MAX_X_DISTANCE;
          const closeVertically = Math.abs(otherItem.y - item.y) < MAX_Y_DISTANCE;
          return closeHorizontally && closeVertically;
        });
        
        if (DEBUG_EXTRACTION) console.log(`Found ${nearbyItems.length} nearby items for ${name}`);
        
        // Look for percentage or numeric values with enhanced pattern matching
        // Sort nearby items left to right, top to bottom for cleaner extraction
        const sortedNearbyItems = nearbyItems.sort((a, b) => {
          if (Math.abs(a.y - b.y) < 5) return a.x - b.x; // Same row, sort by x
          return a.y - b.y; // Different rows, sort by y
        });
        
        // Enhanced value extraction by looking for patterns
        let foundValue = false;
        let value = 0;
        let extractedStatus: KPIStatus = "fair"; // Default
        
        for (const nearbyItem of sortedNearbyItems) {
          // Look for values with status indicators
          const combinedMatch = nearbyItem.str.match(/(\d+(?:\.\d+)?)\s*(?:%|DPMO)?\s*(?:\||\s+)?\s*(poor|fair|great|fantastic|in compliance|not in compliance)/i);
          if (combinedMatch) {
            value = parseFloat(combinedMatch[1]);
            const statusText = combinedMatch[2].toLowerCase();
            
            if (statusText === "poor") extractedStatus = "poor";
            else if (statusText === "fair") extractedStatus = "fair";
            else if (statusText === "great") extractedStatus = "great";
            else if (statusText === "fantastic") extractedStatus = "fantastic";
            else if (statusText === "in compliance") extractedStatus = "in compliance";
            else if (statusText === "not in compliance") extractedStatus = "not in compliance";
            
            foundValue = true;
            if (DEBUG_EXTRACTION) console.log(`Found combined value+status for ${name}: ${value}, status: ${extractedStatus}`);
            break;
          }
          
          // Look for just numeric values with percentage signs
          const valueMatch = nearbyItem.str.match(/(\d+(?:\.\d+)?)\s*(?:%|DPMO)?/i);
          if (valueMatch && !foundValue) {
            value = parseFloat(valueMatch[1]);
            foundValue = true;
            if (DEBUG_EXTRACTION) console.log(`Found numeric value for ${name}: ${value}`);
            // Continue looking for status
          }
          
          // Look for status indicators separately
          if (foundValue) {
            const statusMatch = nearbyItem.str.match(/(?:\||\s+)?\s*(poor|fair|great|fantastic|in compliance|not in compliance)/i);
            if (statusMatch) {
              const statusText = statusMatch[1].toLowerCase();
              
              if (statusText === "poor") extractedStatus = "poor";
              else if (statusText === "fair") extractedStatus = "fair";
              else if (statusText === "great") extractedStatus = "great";
              else if (statusText === "fantastic") extractedStatus = "fantastic";
              else if (statusText === "in compliance") extractedStatus = "in compliance";
              else if (statusText === "not in compliance") extractedStatus = "not in compliance";
              
              if (DEBUG_EXTRACTION) console.log(`Found status for ${name}: ${extractedStatus}`);
              break;
            }
          }
        }
        
        if (foundValue) {
          let calculatedStatus: KPIStatus;
          
          // If no explicit status was found, calculate it based on value
          if (extractedStatus === "fair") {
            calculatedStatus = determineStatus(name, value);
          } else {
            calculatedStatus = extractedStatus;
          }
          
          // Check if we already have this KPI to avoid duplicates
          if (!extractedKPIs.some(kpi => kpi.name === name)) {
            const targetValue = getDefaultTargetForKPI(name);
            
            extractedKPIs.push({
              name,
              value,
              target: targetValue,
              unit,
              trend: "neutral" as const,
              status: calculatedStatus,
              category: category as "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity"
            });
            
            if (DEBUG_EXTRACTION) console.log(`Added KPI ${name} with value ${value}, status: ${calculatedStatus}`);
          }
          
          // Break after finding a valid value
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
            
            if (DEBUG_EXTRACTION) console.log(`Added KPI from row text with status: ${knownKpi.name} = ${value}%, status: ${extractedStatus}`);
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
            
            if (DEBUG_EXTRACTION) console.log(`Added KPI from row text: ${knownKpi.name} = ${value}%`);
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
            
            if (DEBUG_EXTRACTION) console.log(`Added DPMO KPI from row text with status: ${knownKpi.name} = ${value}, status: ${extractedStatus}`);
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
            
            if (DEBUG_EXTRACTION) console.log(`Added DPMO KPI from row text: ${knownKpi.name} = ${value}`);
          }
        }
      }
    }
  }
  
  // Log summarized extraction results
  console.log(`Extracted ${extractedKPIs.length} company KPIs from PDF structure`);
  if (DEBUG_EXTRACTION && extractedKPIs.length > 0) {
    console.log("Extracted KPIs summary:");
    extractedKPIs.forEach(kpi => {
      console.log(`  - ${kpi.name}: ${kpi.value}${kpi.unit} (${kpi.status})`);
    });
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
    console.warn("No company KPIs extracted, returning default set");
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
