
import { DriverKPI } from '../../../../types';
import { createMetricFromValue } from './metricUtils';
import { extractNumeric } from '../../extractors/driver/structural/valueExtractor';

/**
 * Process a table structure extracted from the PDF
 */
export function processTableData(table: any): DriverKPI[] {
  const drivers: DriverKPI[] = [];
  let headerRow = null;
  let headerIndexes: Record<string, number> = {};
  
  // Find the header row first
  for (let i = 0; i < table.rows.length; i++) {
    const row = table.rows[i];
    
    // Look for Transporter ID or similar header
    const hasHeaderCell = row.some((cell: any) => 
      cell.str && (cell.str.includes("Transporter") || 
                    cell.str.includes("ID") || 
                    cell.str.includes("DCR") ||
                    cell.str.includes("DPMO"))
    );
    
    if (hasHeaderCell) {
      headerRow = row;
      
      // Map header cells to their indices
      headerRow.forEach((cell: any, index: number) => {
        const text = cell.str.trim();
        
        if (text.includes("Transporter") || text.includes("ID")) {
          headerIndexes["Transporter ID"] = index;
        } else if (text.includes("Delivered")) {
          headerIndexes["Delivered"] = index;
        } else if (text === "DCR") {
          headerIndexes["DCR"] = index;
        } else if (text.includes("DNR") || text.includes("DPMO")) {
          headerIndexes["DNR DPMO"] = index;
        } else if (text === "POD") {
          headerIndexes["POD"] = index;
        } else if (text === "CC") {
          headerIndexes["CC"] = index;
        } else if (text === "CE") {
          headerIndexes["CE"] = index;
        } else if (text === "DEX") {
          headerIndexes["DEX"] = index;
        }
      });
      
      break;
    }
  }
  
  if (headerRow) {
    // Process all rows after the header row
    const headerIndex = table.rows.indexOf(headerRow);
    
    for (let i = headerIndex + 1; i < table.rows.length; i++) {
      const row = table.rows[i];
      
      // Skip if row is too short
      if (row.length < 3) continue;
      
      // Extract driver ID
      const driverIdIndex = headerIndexes["Transporter ID"] !== undefined ?
        headerIndexes["Transporter ID"] : 0;
      
      if (driverIdIndex < row.length) {
        const driverId = row[driverIdIndex].str.trim();
        
        // Skip if not a valid driver ID
        if (!driverId || !driverId.startsWith('A') || driverId.length < 6) continue;
        
        // Process the driver row
        const metrics = [];
        const metricColumns = [
          { name: "Delivered", index: headerIndexes["Delivered"] },
          { name: "DCR", index: headerIndexes["DCR"] },
          { name: "DNR DPMO", index: headerIndexes["DNR DPMO"] },
          { name: "POD", index: headerIndexes["POD"] },
          { name: "CC", index: headerIndexes["CC"] },
          { name: "CE", index: headerIndexes["CE"] },
          { name: "DEX", index: headerIndexes["DEX"] }
        ];
        
        // Process each metric
        for (const metricDef of metricColumns) {
          if (metricDef.index !== undefined && metricDef.index < row.length) {
            const valueStr = row[metricDef.index].str.trim();
            metrics.push(createMetricFromValue(metricDef.name, valueStr));
          }
        }
        
        if (metrics.length > 0) {
          drivers.push({
            name: driverId,
            status: "active",
            metrics
          });
        }
      }
    }
  }
  
  return drivers;
}
