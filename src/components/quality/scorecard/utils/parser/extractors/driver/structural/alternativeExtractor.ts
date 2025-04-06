
/**
 * Alternative extraction approaches when standard methods fail
 */
import { isNumeric, extractNumeric } from './valueExtractor';
import { processDriverRow } from '../../../driver/processors';
import { determineStatus } from '../../../../helpers/statusHelper';

/**
 * Extract drivers directly from rows without relying on header information
 */
export function extractDriversWithAlternativeApproach(rows: any[]): any[] {
  console.log("Using alternative driver extraction approach");
  const drivers: any[] = [];
  let inDriverSection = false;
  let driversFound = 0;
  
  for (const row of rows) {
    // Skip rows with less than 5 items (likely not a driver row)
    if (row.length < 5) continue;
    
    // Sort row by x-coordinate to ensure correct column order
    const sortedRow = [...row].sort((a, b) => a.x - b.x);
    
    // Check if this is a potential driver row
    const firstColumn = sortedRow[0]?.str || "";
    
    // If we find the "Transporter ID" header, mark that we're in the driver section
    if (firstColumn.includes("Transporter") || 
        firstColumn.includes("ID") || 
        firstColumn.toLowerCase().includes("id")) {
      inDriverSection = true;
      continue;
    }
    
    // If we're in the driver section and find an 'A' prefixed code that looks like a driver ID
    if (inDriverSection && /^A[A-Z0-9]{5,}/.test(firstColumn.trim())) {
      const driverRow = processDriverRow(sortedRow);
      if (driverRow) {
        drivers.push(driverRow);
        driversFound++;
      }
    }
  }
  
  console.log(`Found ${driversFound} drivers using alternative approach`);
  return drivers;
}

/**
 * Extract drivers using aggressive pattern matching when other approaches fail
 */
export function extractDriversAggressively(rows: any[]): any[] {
  console.log("Using aggressive driver ID detection");
  const drivers: any[] = [];
  let driversFound = 0;
  
  // Look for anything that might be a driver ID (starting with A followed by alphanumeric)
  for (const row of rows) {
    // Skip very short rows
    if (row.length < 3) continue;
    
    for (const item of row) {
      const text = item.str.trim();
      // Look for driver IDs starting with 'A'
      if (/^A[A-Z0-9]{5,}/.test(text)) {
        console.log(`Found potential driver ID: ${text}`);
        
        // Now try to find numerical values in the same row
        const rowItems = row.filter((r: any) => r !== item);
        // Sort by x-coordinate to ensure proper order
        const sortedItems = [...rowItems].sort((a: any, b: any) => a.x - b.x);
        
        // Extract all numeric values from this row
        const numericalItems = sortedItems.filter((r: any) => /\d+(?:\.\d+)?|\-/.test(r.str));
        
        if (numericalItems.length >= 3) {
          // This looks like a driver row with metrics
          const metrics = [];
          const metricNames = ['Delivered', 'DCR', 'DNR DPMO', 'POD', 'CC', 'CE', 'DEX'];
          
          // Import needed to avoid circular dependencies
          const { getTargetForMetric, getUnitForMetric } = require('../../../driver/processors');
          
          // Extract up to 7 metrics (or as many as we have values for)
          for (let i = 0; i < Math.min(numericalItems.length, metricNames.length); i++) {
            const valueStr = numericalItems[i].str.trim();
            
            if (valueStr === "-") {
              metrics.push({
                name: metricNames[i],
                value: 0,
                target: getTargetForMetric(metricNames[i]),
                unit: getUnitForMetric(metricNames[i]),
                status: "none" as const
              });
            } else {
              const value = extractNumeric(valueStr);
              metrics.push({
                name: metricNames[i],
                value,
                target: getTargetForMetric(metricNames[i]),
                unit: getUnitForMetric(metricNames[i]),
                status: determineStatus(metricNames[i], value) as any
              });
            }
          }
          
          if (metrics.length > 0) {
            drivers.push({
              name: text,
              status: "active",
              metrics
            });
            driversFound++;
          }
        }
      }
    }
  }
  
  console.log(`Found ${driversFound} drivers using aggressive detection`);
  return drivers;
}
