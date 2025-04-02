
import { determineStatus } from '../../../../helpers/statusHelper';
import { DriverKPI } from '../../../../../types';
import { extractNumeric } from './valueExtractor';

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
    const driverIdIndex = headerIndexes["Transporter ID"];
    
    if (driverIdIndex !== undefined && driverIdIndex < row.length) {
      const driverId = (row[driverIdIndex]?.str || "").trim();
      
      // Skip if driver ID is empty or doesn't look like a valid ID
      // Driver IDs now start with 'A' and are alphanumeric with at least 6 characters
      if (!driverId || driverId.length < 6 || !driverId.startsWith('A')) continue;
      
      console.log(`Processing driver: ${driverId}`);
      
      // Collect metrics for this driver
      const metrics = [];
      
      // Delivered
      if (headerIndexes["Delivered"] !== undefined && headerIndexes["Delivered"] < row.length) {
        const deliveredStr = (row[headerIndexes["Delivered"]]?.str || "").trim();
        const deliveredValue = extractNumeric(deliveredStr);
        
        if (!isNaN(deliveredValue)) {
          metrics.push({
            name: "Delivered",  // Keep original name from PDF
            value: deliveredValue,
            target: 0,
            unit: "",
            status: determineStatus("Delivered", deliveredValue)
          });
        }
      }
      
      // DCR
      if (headerIndexes["DCR"] !== undefined && headerIndexes["DCR"] < row.length) {
        const dcrStr = (row[headerIndexes["DCR"]]?.str || "").trim();
        const dcrValue = extractNumeric(dcrStr);
        
        if (!isNaN(dcrValue)) {
          metrics.push({
            name: "DCR",  // Keep original name from PDF
            value: dcrValue,
            target: 98.5,
            unit: "%",
            status: determineStatus("DCR", dcrValue)
          });
        }
      }
      
      // DNR DPMO
      if (headerIndexes["DNR DPMO"] !== undefined && headerIndexes["DNR DPMO"] < row.length) {
        const dpmoStr = (row[headerIndexes["DNR DPMO"]]?.str || "").trim();
        const dpmoValue = extractNumeric(dpmoStr);
        
        if (!isNaN(dpmoValue)) {
          metrics.push({
            name: "DNR DPMO",
            value: dpmoValue,
            target: 1500,
            unit: "DPMO",
            status: determineStatus("DNR DPMO", dpmoValue)
          });
        }
      }
      
      // POD
      if (headerIndexes["POD"] !== undefined && headerIndexes["POD"] < row.length) {
        const podStr = (row[headerIndexes["POD"]]?.str || "").trim();
        const podValue = extractNumeric(podStr);
        
        if (!isNaN(podValue)) {
          metrics.push({
            name: "POD",
            value: podValue,
            target: 98,
            unit: "%",
            status: determineStatus("POD", podValue)
          });
        }
      }
      
      // CC (Contact Compliance)
      if (headerIndexes["CC"] !== undefined && headerIndexes["CC"] < row.length) {
        const ccStr = (row[headerIndexes["CC"]]?.str || "").trim();
        const ccValue = extractNumeric(ccStr);
        
        if (!isNaN(ccValue)) {
          metrics.push({
            name: "CC",
            value: ccValue,
            target: 95,
            unit: "%",
            status: determineStatus("Contact Compliance", ccValue)
          });
        }
      }
      
      // CE (Customer Escalations)
      if (headerIndexes["CE"] !== undefined && headerIndexes["CE"] < row.length) {
        const ceStr = (row[headerIndexes["CE"]]?.str || "").trim();
        const ceValue = extractNumeric(ceStr);
        
        if (!isNaN(ceValue)) {
          metrics.push({
            name: "CE",
            value: ceValue,
            target: 0,
            unit: "",
            status: ceValue === 0 ? "fantastic" as const : "poor" as const
          });
        }
      }
      
      // DEX
      if (headerIndexes["DEX"] !== undefined && headerIndexes["DEX"] < row.length) {
        const dexStr = (row[headerIndexes["DEX"]]?.str || "").trim();
        const dexValue = extractNumeric(dexStr);
        
        if (!isNaN(dexValue)) {
          metrics.push({
            name: "DEX",
            value: dexValue,
            target: 95,
            unit: "%",
            status: determineStatus("DEX", dexValue)
          });
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
  }
  
  return drivers;
}

/**
 * Process a single driver row (for page 4)
 */
export function processDriverRow(row: any[]): DriverKPI | null {
  // First item should be driver ID
  const driverId = (row[0]?.str || "").trim();
  
  // Driver IDs now start with 'A' and are alphanumeric with at least 6 characters
  if (!driverId || driverId.length < 6 || !driverId.startsWith('A')) return null;
  
  console.log(`Processing standalone driver row: ${driverId} with ${row.length} columns`);
  
  // Extract all numeric values from the row
  const numericValues: number[] = [];
  for (let i = 1; i < row.length; i++) {
    const valueStr = (row[i]?.str || "").trim();
    const numericValue = extractNumeric(valueStr);
    if (!isNaN(numericValue)) {
      numericValues.push(numericValue);
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
    metrics.push({
      name: metricNames[i],
      value: value,
      target: metricTargets[i],
      unit: metricUnits[i],
      status: determineStatus(metricNames[i], value)
    });
  }
  
  return {
    name: driverId,
    status: "active",
    metrics
  };
}
