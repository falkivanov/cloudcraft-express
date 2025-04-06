
import { DriverKPI } from '../../../../types';
import { processMetricsByColumns } from './columnProcessor';

/**
 * Process all data rows from the PDF to extract driver data
 */
export function processDataRows(rows: any[][], headerRowIndex: number, headerIndexes: Record<string, number>): DriverKPI[] {
  const drivers: DriverKPI[] = [];
  
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
    
    // Initialize the driver KPI object
    const driver: DriverKPI = {
      name,
      status: "active",
      metrics: processMetricsByColumns(row, headerIndexes, metricMap)
    };
    
    // Only add driver if we found at least one metric
    if (driver.metrics.length > 0) {
      drivers.push(driver);
    }
  }
  
  return drivers;
}
