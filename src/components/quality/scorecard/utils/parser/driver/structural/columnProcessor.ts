import { KPIStatus } from '../../../../../helpers/statusHelper';
import { determineMetricStatus } from '../utils/metricStatus';
import { createMetric } from '../utils/metricUtils';

/**
 * Process metrics for a driver by column positions
 */
export function processMetricsByColumns(
  row: any[], 
  headerIndexes: Record<string, number>,
  metricMap: Record<string, string>
): { name: string; value: number; target: number; unit: string; status: KPIStatus; }[] {
  const metrics = [];
  
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
        const status = combinedMatch[2].toLowerCase() as KPIStatus;
        
        metrics.push(createMetric(metricName, value, status));
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
        
        let status: KPIStatus;
        if (statusItems.length > 0) {
          const statusMatch = statusItems[0].str.match(/(poor|fair|great|fantastic)/i);
          if (statusMatch) {
            status = statusMatch[1].toLowerCase() as KPIStatus;
          } else {
            status = determineMetricStatus(metricName, value);
          }
        } else {
          // Determine status based on the metric name and value
          status = determineMetricStatus(metricName, value);
        }
        
        metrics.push(createMetric(metricName, value, status));
      }
    }
  }
  
  return metrics;
}
