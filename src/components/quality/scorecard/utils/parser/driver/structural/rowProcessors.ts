
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
      // Driver IDs now start with 'A' and are alphanumeric with length >= 6
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
            const value = cellText === "-" ? 0 : extractNumeric(cellText);
            metrics.push({
              name: metricNames[metricIndex],
              value: value,
              target: metricTargets[metricIndex],
              unit: metricUnits[metricIndex],
              status: determineStatus(metricNames[metricIndex], value)
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
  // First find the cell that contains the driver ID to get its position
  const driverIdCell = row.find(cell => cell.str?.trim() === driverId);
  const driverIdX = driverIdCell ? driverIdCell.x : 0;
  
  console.log(`Driver ${driverId} ID found at x-position: ${driverIdX}`);
  
  // Collect all numeric values that are to the right of the driver ID
  // and store them with their x-coordinates
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
  
  // Create metrics based on the position of values (left to right)
  const metrics = [];
  const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
  const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
  const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
  
  // Use the values we found, up to the number of metric names we have
  for (let i = 0; i < Math.min(valueItems.length, metricNames.length); i++) {
    const item = valueItems[i];
    
    metrics.push({
      name: metricNames[i],
      value: item.value,
      target: metricTargets[i],
      unit: metricUnits[i],
      status: item.str === "-" ? "none" : determineStatus(metricNames[i], item.value)
    });
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
  const driverId = (row[0]?.str || "").trim();
  
  // Driver IDs start with 'A' and are alphanumeric with at least 6 characters
  if (!driverId || driverId.length < 6 || !driverId.startsWith('A')) return null;
  
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
  
  // Map the values to metrics in the expected order (left to right)
  const metrics = [];
  const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
  const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
  const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
  
  // Use the values we found, up to the number of metric names we have
  for (let i = 0; i < Math.min(valueItems.length, metricNames.length); i++) {
    const item = valueItems[i];
    
    metrics.push({
      name: metricNames[i],
      value: item.value,
      target: metricTargets[i],
      unit: metricUnits[i],
      status: item.str === "-" ? "none" : determineStatus(metricNames[i], item.value)
    });
  }
  
  return {
    name: driverId,
    status: "active",
    metrics
  };
}

// Hilfsfunktionen, die unverändert bleiben
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
