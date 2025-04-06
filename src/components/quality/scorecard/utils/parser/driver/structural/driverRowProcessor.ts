
import { DriverKPI } from "../../../../types";
import { KPIStatus } from "../../../../helpers/statusHelper";
import { determineMetricStatus } from '../utils/metricStatus';
import { createMetric } from '../utils/metricUtils';

/**
 * Process a single row of driver data from the PDF
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
  const metrics: Record<string, { value: number, status: KPIStatus }> = {};
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
      const status = combinedMatch[2].toLowerCase() as KPIStatus;
      
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
          metrics[prevMetric].status = itemText.toLowerCase() as KPIStatus;
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
      driver.metrics.push(createMetric(metricName, data.value, data.status));
    }
    
    return driver;
  }
  
  return null;
}
