import { determineStatus } from '@/components/quality/scorecard/utils/helpers/statusHelper';
import { DriverKPI } from '@/components/quality/scorecard/types';
import { extractNumeric, isNumeric } from '../../extractors/driver/structural/valueExtractor';
import { determineMetricStatus } from '../../extractors/driver/utils/metricStatus';

/**
 * Process all data rows after the header row
 */
export function processDataRows(rows: any[][], headerRowIndex: number, headerIndexes: Record<string, number>): DriverKPI[] {
  const drivers: DriverKPI[] = [];
  
  // Process all rows after the header (headerRowIndex + 1)
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    
    // Skip if row is too short
    if (row.length < 4) continue;
    
    // Get driver ID from the first column (Transporter ID)
    const driverIdIndex = headerIndexes["Transporter ID"] !== undefined ? 
      headerIndexes["Transporter ID"] : 0;
    
    if (driverIdIndex < row.length) {
      const driverId = (row[driverIdIndex]?.str || "").trim();
      
      // Skip if driver ID is empty or doesn't look like a valid ID
      // Driver IDs start with 'A' and are alphanumeric with length >= 6
      if (!driverId || driverId.length < 6 || !driverId.startsWith('A')) {
        // Try looking for the first entry in the row that matches the driver ID pattern
        const potentialDriverId = row.find(cell => 
          (cell.str || "").trim().startsWith('A') && (cell.str || "").trim().length >= 6
        );
        
        if (potentialDriverId) {
          const newDriverId = potentialDriverId.str.trim();
          console.log(`Found potential driver ID: ${newDriverId} in row despite wrong column index`);
          processDriverWithId(newDriverId, row, headerIndexes, drivers);
        }
        continue;
      }
      
      console.log(`Processing driver: ${driverId}`);
      processDriverWithId(driverId, row, headerIndexes, drivers);
    } else {
      // Try to find a driver ID in the row anyway
      const firstColumn = row[0]?.str.trim();
      if (firstColumn && firstColumn.startsWith('A') && firstColumn.length >= 6) {
        console.log(`Found driver ID in first column: ${firstColumn} despite missing header index`);
        
        // Create metrics from the remaining columns
        const metrics = [];
        const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
        const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
        const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
        
        let metricIndex = 0;
        for (let j = 1; j < row.length && metricIndex < metricNames.length; j++) {
          const cellText = (row[j]?.str || "").trim();
          
          if (isNumeric(cellText) || cellText === "-") {
            // Apply special handling based on metric type
            const metricName = metricNames[metricIndex];
            let value: number;
            let status: string;
            
            if (cellText === "-") {
              value = 0;
              status = "none";
            } else {
              value = extractNumeric(cellText);
              
              // For "DCR" - Handle low percentages (like 2.1%, 5.2% in the image)
              // Keep the percentage value without transforming
              if (metricName === "DCR" && value < 50) {
                // Already correct decimal value, no transform needed
              }
              // For DNR DPMO - these should remain as integers
              else if (metricName === "DNR DPMO") {
                // Keep integers as-is
              }
              // For percentage fields, don't divide already correct percentages
              else if ((metricName === "POD" || metricName === "CC" || metricName === "DEX") && value < 150) {
                // Already correct percentage, no transform needed
              }
              
              status = determineStatus(metricName, value);
            }
            
            metrics.push({
              name: metricName,
              value: value,
              target: metricTargets[metricIndex],
              unit: metricUnits[metricIndex],
              status: status as any
            });
            metricIndex++;
          }
        }
        
        if (metrics.length > 0) {
          drivers.push({
            name: firstColumn,
            status: "active",
            metrics
          });
        }
      }
    }
  }
  
  return drivers;
}

/**
 * Helper function to process a driver with known ID
 */
function processDriverWithId(driverId: string, row: any[], headerIndexes: Record<string, number>, drivers: DriverKPI[]): void {
  // Collect metrics for this driver
  const metrics = [];
  
  // Known metric columns that we expect to find
  const metricColumns = [
    { name: "Delivered", index: headerIndexes["Delivered"], target: 0, unit: "" },
    { name: "DCR", index: headerIndexes["DCR"], target: 98.5, unit: "%" },
    { name: "DNR DPMO", index: headerIndexes["DNR DPMO"], target: 1500, unit: "DPMO" },
    { name: "POD", index: headerIndexes["POD"], target: 98, unit: "%" },
    { name: "CC", index: headerIndexes["CC"], target: 95, unit: "%" },
    { name: "CE", index: headerIndexes["CE"], target: 0, unit: "" },
    { name: "DEX", index: headerIndexes["DEX"], target: 95, unit: "%" }
  ];
  
  // Process each metric column
  for (const metricDef of metricColumns) {
    if (metricDef.index !== undefined && metricDef.index < row.length) {
      const valueStr = (row[metricDef.index]?.str || "").trim();
      
      if (valueStr === "-") {
        // Handle dash values - these should be treated as missing data or 0
        metrics.push({
          name: metricDef.name,
          value: 0,
          target: metricDef.target,
          unit: metricDef.unit,
          status: "none" as const
        });
      } else {
        // Extract numeric value
        let value = extractNumeric(valueStr);
        
        // Leave integer values as they are for "Delivered" and "CE" metrics
        // These should NOT be transformed (as seen in the image with values like 1266, 8, 97, etc.)
        
        // Special handling for "DCR" - these appear to be actual percentages in the image (4.3%, 12.8%, etc.)
        // Don't convert these to ratios - use them as percentages
        if (metricDef.name === "DCR" && value < 50) {
          // Already the correct percentage value, don't transform
        }
        // For DNR DPMO - these should remain as integers (like 2370, 100, 99, etc.)
        else if (metricDef.name === "DNR DPMO") {
          // Keep integers as-is
        }
        // For other percentage fields (POD, CC, DEX)
        // Don't divide values that are already percentages (like 99.3%, 96.7%, etc.)
        else if ((metricDef.name === "POD" || metricDef.name === "CC" || metricDef.name === "DEX") && 
                value < 150) {
          // Already correct percentage values, don't transform
        }
        
        // Only add valid numeric values
        if (!isNaN(value)) {
          metrics.push({
            name: metricDef.name,
            value,
            target: metricDef.target,
            unit: metricDef.unit,
            status: determineStatus(metricDef.name, value)
          });
        }
      }
    }
  }
  
  // If we don't have metrics for all columns, try to find them by position
  if (metrics.length < metricColumns.length) {
    console.log(`Looking for missing metrics for ${driverId} by position`);
    
    // Get numeric cells by position
    const sortedRow = [...row].sort((a, b) => a.x - b.x);
    const numericCells = sortedRow.filter((item, index) => 
      index > 0 && (isNumeric(item.str) || item.str.trim() === "-")
    );
    
    // Create a map of already found metrics
    const foundMetrics = new Set(metrics.map(m => m.name));
    
    // Add missing metrics based on position
    let metricIndex = 0;
    for (const metricDef of metricColumns) {
      const metricName = metricDef.name;
      
      // Skip if we already have this metric
      if (foundMetrics.has(metricName)) continue;
      
      // Find the corresponding numeric cell based on position
      if (metricIndex < numericCells.length) {
        const valueStr = numericCells[metricIndex].str.trim();
        
        if (valueStr === "-") {
          metrics.push({
            name: metricName,
            value: 0,
            target: metricDef.target,
            unit: metricDef.unit,
            status: "none" as const
          });
        } else {
          let value = extractNumeric(valueStr);
          
          // Apply the same percentage handling as above
          // Special handling for "DCR" - these appear to be actual percentages
          if (metricName === "DCR" && value < 50) {
            // Already correct percentage value, don't transform
          }
          // For DNR DPMO - keep as integers
          else if (metricName === "DNR DPMO") {
            // Keep integers as-is
          }
          // For other percentage fields
          else if ((metricName === "POD" || metricName === "CC" || metricName === "DEX") && 
                  value < 150) {
            // Already correct percentage values, don't transform
          }
          
          metrics.push({
            name: metricName,
            value,
            target: metricDef.target,
            unit: metricDef.unit,
            status: determineStatus(metricName, value)
          });
        }
        
        metricIndex++;
      }
    }
  }
  
  // Only add driver if we found at least some metrics
  if (metrics.length > 0) {
    drivers.push({
      name: driverId,
      status: "active",
      metrics
    });
  }
}

/**
 * Process a row of driver data from the PDF
 */
export function processDriverRow(row: any[]): DriverKPI | null {
  // First item should be driver ID
  const driverId = (row[0]?.str || "").trim();
  
  // Driver IDs in the image start with 'A' and are alphanumeric with at least 6 characters
  if (!driverId || driverId.length < 6 || !driverId.startsWith('A')) return null;
  
  console.log(`Processing standalone driver row: ${driverId} with ${row.length} columns`);
  
  // Extract all values from the row
  const metrics = [];
  const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
  const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
  const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
  
  // Process each metric column starting from index 1 (after the driver ID)
  for (let i = 1; i < Math.min(row.length, metricNames.length + 1); i++) {
    const valueStr = (row[i]?.str || "").trim();
    const metricName = metricNames[i-1];
    
    if (valueStr === "-") {
      // Handle dash values
      metrics.push({
        name: metricName,
        value: 0,
        target: metricTargets[i-1],
        unit: metricUnits[i-1],
        status: "none" as const
      });
    } else if (valueStr) {
      let value = extractNumeric(valueStr);
      
      // Apply special handling for percentage values
      // For DCR - these are already percentages
      if (metricName === "DCR" && value < 50) {
        // Already correct percentage value, don't transform
      }
      // For DNR DPMO - keep as integers
      else if (metricName === "DNR DPMO") {
        // Keep integers as-is
      }
      // For other percentage fields
      else if ((metricName === "POD" || metricName === "CC" || metricName === "DEX") && 
              value < 150) {
        // Already correct percentage values, don't transform
      }
      
      metrics.push({
        name: metricName,
        value,
        target: metricTargets[i-1],
        unit: metricUnits[i-1],
        status: determineStatus(metricName, value)
      });
    }
  }
  
  // Only create driver if we found at least some metrics
  if (metrics.length > 0) {
    return {
      name: driverId,
      status: "active",
      metrics
    };
  }
  
  return null;
}

/**
 * Helper function to get the target value for a metric
 */
function getTargetForMetric(metricName: string): number {
  switch (metricName) {
    case "Delivered": return 0;
    case "DCR": return 98.5;
    case "DNR DPMO": return 1500;
    case "POD": return 98;
    case "CC": return 95;
    case "CE": return 0;
    case "DEX": return 95;
    default: return 0;
  }
}

/**
 * Helper function to get the unit for a metric
 */
function getUnitForMetric(metricName: string): string {
  switch (metricName) {
    case "DCR": return "%";
    case "DNR DPMO": return "DPMO";
    case "POD": return "%";
    case "CC": return "%";
    case "CE": return "";
    case "DEX": return "%";
    default: return "";
  }
}

/**
 * Get fallback cell index for a specific metric
 */
function getFallbackCellIndex(metricName: string): number {
  switch (metricName) {
    case "Delivered": return 1;
    case "DCR": return 2;
    case "DNR DPMO": return 3;
    case "POD": return 4;
    case "CC": return 5;
    case "CE": return 6;
    case "DEX": return 7;
    default: return 0;
  }
}
