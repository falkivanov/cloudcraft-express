import { determineStatus } from '../../../../helpers/statusHelper';
import { DriverKPI } from '../../../../../types';
import { extractNumeric, isNumeric } from './valueExtractor';

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
      const firstColumn = row[0]?.str?.trim();
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
            const isDash = cellText === "-";
            const value = isDash ? 0 : extractNumeric(cellText);
            metrics.push({
              name: metricNames[metricIndex],
              value: value,
              target: metricTargets[metricIndex],
              unit: metricUnits[metricIndex],
              status: isDash ? "none" : determineStatus(metricNames[metricIndex], value)
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
  const metricDefs = [
    { name: "Delivered", index: headerIndexes["Delivered"], target: 0, unit: "" },
    { name: "DCR", index: headerIndexes["DCR"], target: 98.5, unit: "%" },
    { name: "DNR DPMO", index: headerIndexes["DNR DPMO"], target: 1500, unit: "DPMO" },
    { name: "POD", index: headerIndexes["POD"], target: 98, unit: "%" },
    { name: "CC", index: headerIndexes["CC"], target: 95, unit: "%" },
    { name: "CE", index: headerIndexes["CE"], target: 0, unit: "" },
    { name: "DEX", index: headerIndexes["DEX"], target: 95, unit: "%" }
  ];
  
  // Process each metric column
  for (const metricDef of metricDefs) {
    if (metricDef.index !== undefined && metricDef.index < row.length) {
      // Skip LoR DPMO column if present
      if (headerIndexes["LoR DPMO"] !== undefined && 
          metricDef.index > headerIndexes["DNR DPMO"] && 
          metricDef.index <= headerIndexes["LoR DPMO"]) {
        continue;
      }
      
      const valueStr = (row[metricDef.index]?.str || "").trim();
      
      if (valueStr === "-") {
        metrics.push({
          name: metricDef.name,
          value: 0,
          target: metricDef.target,
          unit: metricDef.unit,
          status: "none"
        });
      } else if (isNumeric(valueStr)) {
        const value = extractNumeric(valueStr);
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
  
  // If we don't have metrics for all columns, try to find them by position
  if (metrics.length < metricDefs.length) {
    console.log(`Looking for missing metrics for ${driverId} by position`);
    
    // Get numeric cells by position
    const sortedRow = [...row].sort((a, b) => a.x - b.x);
    const numericCells = sortedRow.filter((item, index) => 
      index > 0 && (isNumeric(item.str) || item.str.trim() === "-")
    );
    
    // Create a map of already found metrics
    const foundMetrics = new Set(metrics.map(m => m.name));
    
    // Add missing metrics based on position
    for (let i = 0; i < metricDefs.length; i++) {
      const metricName = metricDefs[i].name;
      
      // Skip if we already have this metric
      if (foundMetrics.has(metricName)) continue;
      
      // Find the corresponding numeric cell based on position
      const cellIndex = i + 1; // +1 because first cell is driver ID
      if (cellIndex < numericCells.length) {
        const valueStr = numericCells[cellIndex].str.trim();
        
        if (valueStr === "-") {
          metrics.push({
            name: metricName,
            value: 0,
            target: metricDefs[i].target,
            unit: metricDefs[i].unit,
            status: "none" as const
          });
        } else {
          const value = extractNumeric(valueStr);
          metrics.push({
            name: metricName,
            value,
            target: metricDefs[i].target,
            unit: metricDefs[i].unit,
            status: determineStatus(metricName, value)
          });
        }
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
 * Process a single driver row (for page 4)
 */
export function processDriverRow(row: any[]): DriverKPI | null {
  // First item should be driver ID
  const driverId = (row[0]?.str || "").trim();
  
  // Driver IDs start with 'A' and are alphanumeric with at least 6 characters
  if (!driverId || driverId.length < 6 || !driverId.startsWith('A')) return null;
  
  console.log(`Processing standalone driver row: ${driverId} with ${row.length} columns`);
  
  // Extract all numeric values from the row
  const numericValues: number[] = [];
  const valueStrings: string[] = [];
  
  for (let i = 1; i < row.length; i++) {
    const valueStr = (row[i]?.str || "").trim();
    valueStrings.push(valueStr);
    
    if (valueStr === "-") {
      numericValues.push(0);
    } else {
      const numericValue = extractNumeric(valueStr);
      if (!isNaN(numericValue)) {
        numericValues.push(numericValue);
      }
    }
  }
  
  if (numericValues.length < 3) return null;
  
  // Map the numeric values to metrics in the expected order
  const metrics = [];
  const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
  const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
  const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
  
  for (let i = 0; i < Math.min(numericValues.length, metricNames.length); i++) {
    const value = numericValues[i];
    const valueStr = valueStrings[i] || "";
    
    metrics.push({
      name: metricNames[i],
      value: value,
      target: metricTargets[i],
      unit: metricUnits[i],
      status: valueStr === "-" ? "none" as const : determineStatus(metricNames[i], value)
    });
  }
  
  return {
    name: driverId,
    status: "active",
    metrics
  };
}
