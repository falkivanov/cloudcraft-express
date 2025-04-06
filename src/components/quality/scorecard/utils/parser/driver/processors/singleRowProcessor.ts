
import { DriverKPI } from '../../../../types';
import { createMetricFromValue } from './metricUtils';
import { DEFAULT_METRIC_ORDER } from './constants';

/**
 * Process a single driver row (for page 4)
 */
export function processDriverRow(row: any[]): DriverKPI | null {
  // First item should be driver ID
  const driverId = (row[0]?.str || "").trim();
  
  // Driver IDs start with 'A' and are alphanumeric with at least 6 characters
  if (!driverId || driverId.length < 6 || !driverId.startsWith('A')) return null;
  
  console.log(`Processing standalone driver row: ${driverId} with ${row.length} columns`);
  
  // Create metrics array
  const metrics = [];
  
  // Process each metric column starting from index 1 (after the driver ID)
  for (let i = 1; i < Math.min(row.length, DEFAULT_METRIC_ORDER.length + 1); i++) {
    const valueStr = (row[i]?.str || "").trim();
    const metricName = DEFAULT_METRIC_ORDER[i-1];
    
    if (valueStr) {
      metrics.push(createMetricFromValue(metricName, valueStr));
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
