
import { determineStatus } from '@/components/quality/scorecard/utils/helpers/statusHelper';
import { DriverKPI } from '@/components/quality/scorecard/types';
import { extractNumeric, isNumeric } from './valueExtractor';
import { determineMetricStatus } from '../utils/metricStatus';

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
      
      // If driver ID is in the expected format, process it
      if (driverId && driverId.startsWith('A')) {
        console.log(`Processing driver: ${driverId}`);
        processDriverWithId(driverId, row, headerIndexes, drivers);
      }
      // Try looking for the first entry in the row that matches the driver ID pattern
      else {
        const potentialDriverId = row.find(cell => 
          (cell.str || "").trim().startsWith('A') && (cell.str || "").trim().length >= 6
        );
        
        if (potentialDriverId) {
          const newDriverId = potentialDriverId.str.trim();
          console.log(`Found potential driver ID: ${newDriverId} in row despite wrong column index`);
          processDriverWithId(newDriverId, row, headerIndexes, drivers);
        }
      }
    } else {
      // Try to find a driver ID in the row anyway
      const firstColumn = row[0]?.str?.trim();
      if (firstColumn && firstColumn.startsWith('A')) {
        console.log(`Found driver ID in first column: ${firstColumn} despite missing header index`);
        processDriverWithId(firstColumn, row, headerIndexes, drivers);
      }
    }
  }
  
  return drivers;
}

/**
 * Helper function to process a driver with known ID
 * Enhanced to better handle structured table data
 */
function processDriverWithId(driverId: string, row: any[], headerIndexes: Record<string, number>, drivers: DriverKPI[]): void {
  // Find the cell that contains the driver ID to get its position
  const driverIdCell = row.find(cell => cell.str?.trim() === driverId);
  const driverIdX = driverIdCell ? driverIdCell.x : 0;
  
  console.log(`Driver ${driverId} ID found at x-position: ${driverIdX}`);
  
  // Get all available header names in order
  const headerNames = Object.keys(headerIndexes).filter(name => name !== "Transporter ID");
  console.log(`Available header names for ${driverId}:`, headerNames);
  
  // Use direct header mappings including new columns like LoR DPMO and CDF
  const metricDefs = [
    { name: "Delivered", header: "Delivered", target: 0, unit: "", index: headerIndexes["Delivered"] },
    { name: "DCR", header: "DCR", target: 98.5, unit: "%", index: headerIndexes["DCR"] },
    { name: "DNR DPMO", header: "DNR DPMO", target: 1500, unit: "DPMO", index: headerIndexes["DNR DPMO"] },
    { name: "LoR DPMO", header: "LoR DPMO", target: 1500, unit: "DPMO", index: headerIndexes["LoR DPMO"] },
    { name: "POD", header: "POD", target: 98, unit: "%", index: headerIndexes["POD"] },
    { name: "CC", header: "CC", target: 95, unit: "%", index: headerIndexes["CC"] },
    { name: "CE", header: "CE", target: 0, unit: "", index: headerIndexes["CE"] },
    { name: "DEX", header: "DEX", target: 95, unit: "%", index: headerIndexes["DEX"] },
    { name: "CDF", header: "CDF", target: 95, unit: "%", index: headerIndexes["CDF"] }
  ];
  
  const metrics = [];
  
  // APPROACH 1: Try to use the header indexes if available
  let foundHeaderBasedMetrics = 0;
  
  // Try to find metrics by their actual header names
  for (const headerName of headerNames) {
    if (headerIndexes[headerName] !== undefined && headerIndexes[headerName] < row.length) {
      const valueStr = (row[headerIndexes[headerName]]?.str || "").trim();
      
      if (valueStr === "-") {
        metrics.push({
          name: headerName,
          value: 0,
          target: getTargetForMetric(headerName),
          unit: getUnitForMetric(headerName),
          status: "none"
        });
        foundHeaderBasedMetrics++;
      } else if (isNumeric(valueStr)) {
        const value = extractNumeric(valueStr);
        metrics.push({
          name: headerName,
          value,
          target: getTargetForMetric(headerName),
          unit: getUnitForMetric(headerName),
          status: determineStatus(headerName, value)
        });
        foundHeaderBasedMetrics++;
      }
    }
  }
  
  // APPROACH 2: If header indexes didn't work well, collect all numeric values to the right of the driver ID
  if (foundHeaderBasedMetrics < 3) {
    console.log(`Header-based approach found only ${foundHeaderBasedMetrics} metrics, trying positional approach`);
    
    // Clear metrics and start over with positional approach
    metrics.length = 0;
    
    // Collect all numeric values that are to the right of the driver ID and store them with their x-coordinates
    const valueItems: {str: string, value: number, x: number}[] = [];
    
    for (const cell of row) {
      if (cell.x > driverIdX && cell.str) {
        const valueStr = cell.str.trim();
        
        // Consider both numeric values and dash symbols
        if (valueStr === "-") {
          valueItems.push({
            str: valueStr,
            value: 0,
            x: cell.x
          });
        } else if (isNumeric(valueStr)) {
          valueItems.push({
            str: valueStr,
            value: extractNumeric(valueStr),
            x: cell.x
          });
        }
      }
    }
    
    // Sort the values from left to right based on their x-coordinate
    valueItems.sort((a, b) => a.x - b.x);
    
    console.log(`Driver ${driverId} has ${valueItems.length} values: ${valueItems.map(v => v.str).join(', ')}`);
    
    // Use the header names we already found, or fall back to defaults
    let metricNames: string[] = headerNames.length > 0 ? 
      headerNames : ["Delivered", "DCR", "DNR DPMO", "LoR DPMO", "POD", "CC", "CE", "CDF"];
    
    // Use the values we found, up to the number of metric names we have
    for (let i = 0; i < Math.min(valueItems.length, metricNames.length); i++) {
      const item = valueItems[i];
      const metricName = metricNames[i];
      
      metrics.push({
        name: metricName,
        value: item.value,
        target: getTargetForMetric(metricName),
        unit: getUnitForMetric(metricName),
        status: item.str === "-" ? "none" : determineStatus(metricName, item.value)
      });
    }
  }
  
  // Only add the driver if we found some metrics
  if (metrics.length > 0) {
    drivers.push({
      name: driverId,
      status: "active",
      metrics
    });
    console.log(`Added driver ${driverId} with ${metrics.length} metrics`);
  }
}

/**
 * Process a single driver row (for page 4)
 */
export function processDriverRow(row: any[]): DriverKPI | null {
  // First item should be driver ID
  let driverId = (row[0]?.str || "").trim();
  
  // Driver IDs typically start with 'A'
  if (!driverId || !driverId.startsWith('A')) {
    // Try to find an A-prefixed ID in the row
    for (const cell of row) {
      const cellText = cell.str?.trim();
      if (cellText && cellText.startsWith('A') && cellText.length >= 6) {
        driverId = cellText;
        break;
      }
    }
    
    // If still no valid ID found, return null
    if (!driverId || !driverId.startsWith('A')) return null;
  }
  
  console.log(`Processing standalone driver row: ${driverId} with ${row.length} columns`);
  
  // Find the cell with the driver ID
  const driverIdCell = row.find(cell => cell.str?.trim() === driverId);
  const driverIdX = driverIdCell ? driverIdCell.x : 0;
  
  // Collect all values to the right of the driver ID
  const valueItems: {str: string, value: number, x: number}[] = [];
  
  for (const cell of row) {
    if (cell.x > driverIdX && cell.str) {
      const valueStr = cell.str.trim();
      
      // Consider both numeric values and dash symbols
      if (valueStr === "-") {
        valueItems.push({
          str: valueStr,
          value: 0,
          x: cell.x
        });
      } else if (isNumeric(valueStr)) {
        valueItems.push({
          str: valueStr,
          value: extractNumeric(valueStr),
          x: cell.x
        });
      }
    }
  }
  
  // Sort values by x-coordinate (left to right)
  valueItems.sort((a, b) => a.x - b.x);
  
  console.log(`Driver row ${driverId} has ${valueItems.length} values: ${valueItems.map(v => v.str).join(', ')}`);
  
  if (valueItems.length < 3) return null;
  
  // Support dynamic column names including LoR DPMO and CDF
  const metricNames = ["Delivered", "DCR", "DNR DPMO", "LoR DPMO", "POD", "CC", "CE", "CDF", "DEX"];
  
  // Use the values we found, up to the number of metric names we have
  const metrics = [];
  for (let i = 0; i < Math.min(valueItems.length, metricNames.length); i++) {
    const item = valueItems[i];
    const metricName = metricNames[i];
    
    metrics.push({
      name: metricName,
      value: item.value,
      target: getTargetForMetric(metricName),
      unit: getUnitForMetric(metricName),
      status: item.str === "-" ? "none" : determineStatus(metricName, item.value)
    });
  }
  
  return {
    name: driverId,
    status: "active",
    metrics
  };
}

// Helper functions to get target and unit for metrics
function getTargetForMetric(metricName: string): number {
  switch (metricName) {
    case "Delivered": return 0;
    case "DCR": return 98.5;
    case "DNR DPMO": return 1500;
    case "LoR DPMO": return 1500;
    case "POD": return 98;
    case "CC": return 95;
    case "CE": return 0;
    case "DEX": return 95;
    case "CDF": return 95;
    default: return 0;
  }
}

function getUnitForMetric(metricName: string): string {
  switch (metricName) {
    case "DCR": return "%";
    case "DNR DPMO": return "DPMO";
    case "LoR DPMO": return "DPMO";
    case "POD": return "%";
    case "CC": return "%";
    case "CE": return "";
    case "DEX": return "%";
    case "CDF": return "%";
    default: return "";
  }
}
