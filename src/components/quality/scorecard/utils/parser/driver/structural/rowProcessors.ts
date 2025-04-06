
import { determineStatus } from '../../../../helpers/statusHelper';
import { DriverKPI } from '../../../../types';
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
            // Apply special handling based on metric type
            const metricName = metricNames[metricIndex];
            let value = cellText === "-" ? 0 : extractNumeric(cellText);
            
            // For percentage fields, ensure values are in the correct range
            if ((metricName === "DCR" || metricName === "POD" || metricName === "CC" || metricName === "DEX") && 
                cellText !== "-") {
              if (value > 100) {
                value = value / 100;
              }
            }
            
            metrics.push({
              name: metricName,
              value: value,
              target: metricTargets[metricIndex],
              unit: metricUnits[metricIndex],
              status: cellText === "-" ? "none" : determineStatus(metricName, value)
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
        // Handle dash values
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
        
        // Special handling for percentage fields
        if ((metricDef.name === "DCR" || metricDef.name === "POD" || 
            metricDef.name === "CC" || metricDef.name === "DEX") && 
            valueStr.includes('%') && value > 100) {
          value = value / 100;
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
    for (let i = 0; i < metricColumns.length; i++) {
      const metricName = metricColumns[i].name;
      
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
            target: metricColumns[i].target,
            unit: metricColumns[i].unit,
            status: "none" as const
          });
        } else {
          let value = extractNumeric(valueStr);
          
          // Handle percentage fields correctly
          if ((metricName === "DCR" || metricName === "POD" || 
              metricName === "CC" || metricName === "DEX") && 
              valueStr.includes('%') && value > 100) {
            value = value / 100;
          }
          
          metrics.push({
            name: metricName,
            value,
            target: metricColumns[i].target,
            unit: metricColumns[i].unit,
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
 * Process a row of driver data from the PDF
 */
export function processDriverRow(row: any[]): DriverKPI | null {
  // Check if this is likely a driver row by looking for a name or ID
  const firstItem = row[0]?.str;
  if (!firstItem || firstItem.trim().length === 0) return null;
  
  // Skip header rows and rows with less than 2 items
  if (row.length < 2 || 
      firstItem.includes('Transporter') || 
      firstItem.includes('Driver') || 
      firstItem.includes('ID')) {
    return null;
  }
  
  // Extract driver name from first column
  const name = firstItem.trim();
  
  // Initialize metrics object
  const metrics: Record<string, { value: number, status: string }> = {};
  const metricNames = ['Delivered', 'DCR', 'DNR DPMO', 'POD', 'CC', 'CE', 'DEX'];
  
  // Sort remaining items horizontally to ensure correct order
  const sortedItems = row.slice(1).sort((a, b) => a.x - b.x);
  
  // Process each metric column
  let currentMetricIndex = 0;
  
  for (const item of sortedItems) {
    if (currentMetricIndex >= metricNames.length) break;
    
    const itemText = item.str.trim();
    if (!itemText) continue;
    
    // Check if this item contains both a value and a status (e.g., "98.5% | Great")
    const combinedMatch = itemText.match(/(\d+(?:\.\d+)?)\s*(?:%|DPMO)?\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i);
    
    if (combinedMatch) {
      const value = parseFloat(combinedMatch[1]);
      const status = combinedMatch[2].toLowerCase();
      
      metrics[metricNames[currentMetricIndex]] = { 
        value, 
        status 
      };
      currentMetricIndex++;
    } 
    // Check if it's just a numeric value
    else if (/^\d+(?:\.\d+)?(?:\s*(?:%|DPMO))?$/.test(itemText)) {
      const value = parseFloat(itemText.replace(/[^\d.]/g, ''));
      
      // Determine status based on the metric name and value
      const status = determineStatus(metricNames[currentMetricIndex], value);
      
      metrics[metricNames[currentMetricIndex]] = { 
        value, 
        status 
      };
      currentMetricIndex++;
    }
    // Check if it's just a status indication
    else if (/^(?:poor|fair|great|fantastic)$/i.test(itemText)) {
      // This is likely a status for the previous value
      // Only use it if we've already started processing metrics and the previous one has no status
      if (currentMetricIndex > 0) {
        const prevMetric = metricNames[currentMetricIndex - 1];
        if (metrics[prevMetric]) {
          metrics[prevMetric].status = itemText.toLowerCase();
        }
      }
    }
    // Otherwise increment counter if this looks like a separator or empty column
    else if (itemText === '|' || itemText === '-' || itemText === '' || /^\s+$/.test(itemText)) {
      // Skip separators
    } 
    // Otherwise try to parse a number from whatever text is there
    else {
      const numericMatch = itemText.match(/(\d+(?:\.\d+)?)/);
      if (numericMatch) {
        const value = parseFloat(numericMatch[1]);
        
        // Determine status based on the metric name and value
        const status = determineStatus(metricNames[currentMetricIndex], value);
        
        metrics[metricNames[currentMetricIndex]] = { 
          value, 
          status 
        };
        currentMetricIndex++;
      }
    }
  }
  
  // Only create driver if we found at least some metrics
  if (Object.keys(metrics).length > 0) {
    // Build the driver object with proper type structure
    const driver: DriverKPI = {
      name,
      status: "active", // Set default status to active
      metrics: [] // Initialize with empty array to fix type error
    };
    
    // Add each metric to the driver's metrics array
    for (const [metricName, data] of Object.entries(metrics)) {
      driver.metrics.push({
        name: metricName,
        value: data.value,
        target: getTargetForMetric(metricName),
        unit: getUnitForMetric(metricName),
        status: data.status as any
      });
    }
    
    return driver;
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
