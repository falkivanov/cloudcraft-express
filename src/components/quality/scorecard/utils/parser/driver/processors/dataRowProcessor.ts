
import { DriverKPI } from '../../../../types';
import { createMetricFromValue } from './metricUtils';
import { isNumeric } from '../../extractors/driver/structural/valueExtractor';
import { DEFAULT_METRIC_ORDER } from './constants';

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
        
        let metricIndex = 0;
        for (let j = 1; j < row.length && metricIndex < DEFAULT_METRIC_ORDER.length; j++) {
          const cellText = (row[j]?.str || "").trim();
          
          if (isNumeric(cellText) || cellText === "-") {
            const metricName = DEFAULT_METRIC_ORDER[metricIndex];
            metrics.push(createMetricFromValue(metricName, cellText));
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
    { name: "Delivered", index: headerIndexes["Delivered"] },
    { name: "DCR", index: headerIndexes["DCR"] },
    { name: "DNR DPMO", index: headerIndexes["DNR DPMO"] },
    { name: "POD", index: headerIndexes["POD"] },
    { name: "CC", index: headerIndexes["CC"] },
    { name: "CE", index: headerIndexes["CE"] },
    { name: "DEX", index: headerIndexes["DEX"] }
  ];
  
  // Process each metric column
  for (const metricDef of metricColumns) {
    if (metricDef.index !== undefined && metricDef.index < row.length) {
      const valueStr = (row[metricDef.index]?.str || "").trim();
      metrics.push(createMetricFromValue(metricDef.name, valueStr));
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
    for (let i = 0; i < metricColumns.length; i++) {
      const metricName = metricColumns[i].name;
      
      // Skip if we already have this metric
      if (foundMetrics.has(metricName)) continue;
      
      // Find the corresponding numeric cell based on position
      const cellIndex = i + 1; // +1 because first cell is driver ID
      if (cellIndex < numericCells.length) {
        const valueStr = numericCells[cellIndex].str.trim();
        metrics.push(createMetricFromValue(metricName, valueStr));
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
