import { DriverKPI } from '../../../../types';
import { determineMetricStatus } from '../utils/metricStatus';
import { getDefaultTargetForKPI } from '../../../utils/helpers/statusHelper';

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
      const status = determineMetricStatus(metricNames[currentMetricIndex], value);
      
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
        const status = determineMetricStatus(metricNames[currentMetricIndex], value);
        
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
 * Process all data rows from the PDF to extract driver data
 */
export function processDataRows(rows: any[][], headerRowIndex: number, headerIndexes: Record<string, number>): DriverKPI[] {
  const drivers: DriverKPI[] = [];
  
  // Process each row after the header row
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    
    // Skip empty rows
    if (!row || row.length === 0) continue;
    
    // Get the name item (usually first column)
    const nameItem = row.find(item => 
      item.x >= headerIndexes["Transporter ID"] - 20 && 
      item.x <= headerIndexes["Transporter ID"] + 20
    );
    
    // Skip if no name found or it's empty
    if (!nameItem || !nameItem.str.trim()) continue;
    
    // Skip if this is a header or sub-header row
    if (nameItem.str.includes('Driver') || 
        nameItem.str.includes('Transporter') || 
        nameItem.str.includes('ID') ||
        nameItem.str.includes('Total')) {
      continue;
    }
    
    // Get the driver name
    const name = nameItem.str.trim();
    
    // Initialize the driver KPI object with proper type structure
    const driver: DriverKPI = {
      name,
      status: "active",
      metrics: [] // Initialize with empty array to fix type error
    };
    
    // Map of column headers to their metrics
    const metricMap: Record<string, string> = {
      "Delivered": "Delivered",
      "DCR": "DCR",
      "DNR DPMO": "DNR DPMO",
      "POD": "POD",
      "CC": "CC",
      "CE": "CE",
      "DEX": "DEX"
    };
    
    // Process each column
    for (const [header, metricName] of Object.entries(metricMap)) {
      if (headerIndexes[header] === undefined) continue;
      
      // Find items around this column position
      const itemsInColumn = row.filter(item => 
        Math.abs(item.x - headerIndexes[header]) < 20
      );
      
      // Skip if no items found in this column
      if (itemsInColumn.length === 0) continue;
      
      // Check if any item contains both a value and a status
      const combinedItems = itemsInColumn.filter(item => 
        item.str.match(/(\d+(?:\.\d+)?)\s*(?:%|DPMO)?\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i)
      );
      
      if (combinedItems.length > 0) {
        // Process combined value and status
        const combinedMatch = combinedItems[0].str.match(/(\d+(?:\.\d+)?)\s*(?:%|DPMO)?\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i);
        if (combinedMatch) {
          const value = parseFloat(combinedMatch[1]);
          const status = combinedMatch[2].toLowerCase();
          
          driver.metrics.push({
            name: metricName,
            value,
            target: getTargetForMetric(metricName),
            unit: getUnitForMetric(metricName),
            status: status as any
          });
          continue;
        }
      }
      
      // Look for value and status separately
      const valueItems = itemsInColumn.filter(item => 
        item.str.match(/\d+(?:\.\d+)?/)
      );
      
      if (valueItems.length > 0) {
        // Extract the numeric value
        const valueMatch = valueItems[0].str.match(/(\d+(?:\.\d+)?)/);
        if (valueMatch) {
          const value = parseFloat(valueMatch[1]);
          
          // Look for status in adjacent items
          const statusItems = row.filter(item => 
            Math.abs(item.x - valueItems[0].x - valueItems[0].width) < 20 &&
            Math.abs(item.y - valueItems[0].y) < 5 &&
            /poor|fair|great|fantastic/i.test(item.str)
          );
          
          let status;
          if (statusItems.length > 0) {
            const statusMatch = statusItems[0].str.match(/(poor|fair|great|fantastic)/i);
            if (statusMatch) {
              status = statusMatch[1].toLowerCase();
            }
          }
          
          if (!status) {
            // Determine status based on the metric name and value
            status = determineMetricStatus(metricName, value);
          }
          
          driver.metrics.push({
            name: metricName,
            value,
            target: getTargetForMetric(metricName),
            unit: getUnitForMetric(metricName),
            status: status as any
          });
        }
      }
    }
    
    // Only add driver if we found at least one metric
    if (driver.metrics.length > 0) {
      drivers.push(driver);
    }
  }
  
  return drivers;
}

/**
 * Helper function to get the target value for a metric
 */
function getTargetForMetric(metricName: string): number {
  // First try to get the target from our helper function
  const target = getDefaultTargetForKPI(`Driver ${metricName}`);
  if (target !== 95) {
    // If we got a non-default value, use it
    return target;
  }
  
  // Otherwise use our hardcoded values
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
