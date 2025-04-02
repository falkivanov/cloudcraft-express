import { DriverKPI } from '../../../../../types';
import { determineStatus } from '../../../../helpers/statusHelper';
import { extractNumeric, isNumeric } from '../structural/valueExtractor';

/**
 * Find a grid-based driver table in the PDF and extract drivers
 */
export function findDriverTable(pageData: Record<number, any>): DriverKPI[] {
  console.log("Looking for driver table grid in ALL PDF pages");
  
  // Get all available pages, not just 2, 3, and 4
  const availablePages = Object.keys(pageData).map(Number).sort();
  console.log(`Available pages for table extraction: ${availablePages.join(', ')}`);
  
  const allDrivers: DriverKPI[] = [];
  
  // Process every available page
  for (const pageNum of availablePages) {
    console.log(`Analyzing page ${pageNum} for driver table grid`);
    const page = pageData[pageNum];
    if (!page || !page.items || page.items.length === 0) {
      console.log(`Page ${pageNum} has no items, skipping`);
      continue;
    }
    
    // First look for header cells that would indicate a driver table
    const headerIndicators = ["transporter id", "driver", "delivered", "dcr", "dnr", "dpmo", "pod", "cc", "ce", "dex"];
    
    const headerCells = page.items.filter(item => 
      headerIndicators.some(indicator => 
        (item.str || "").toLowerCase().includes(indicator)
      )
    );
    
    if (headerCells.length >= 3) {
      console.log(`Found ${headerCells.length} header cells on page ${pageNum}`);
      
      // Find driver ID cells (starting with 'A')
      const driverIdCells = page.items.filter(item => {
        const str = (item.str || "").trim();
        return str.startsWith('A') && str.length >= 6;
      });
      
      console.log(`Found ${driverIdCells.length} potential driver IDs on page ${pageNum}`);
      
      if (driverIdCells.length >= 1) {
        let driversFoundOnPage = 0;
        
        // Process each driver ID cell as a starting point for a row
        for (const idCell of driverIdCells) {
          const driverId = idCell.str.trim();
          
          // Skip if we already found this driver
          if (allDrivers.some(d => d.name === driverId)) {
            continue;
          }
          
          // Find cells that are aligned horizontally with the driver ID
          // with a small vertical tolerance (±5 pixels)
          const rowCells = page.items.filter(item => 
            Math.abs(item.y - idCell.y) < 5 &&
            item !== idCell
          ).sort((a, b) => a.x - b.x);
          
          if (rowCells.length >= 2) {
            // Filter out non-numeric cells
            const metricCells = rowCells.filter(cell => 
              isNumeric((cell.str || "").trim())
            );
            
            if (metricCells.length >= 2) {
              console.log(`Found driver ${driverId} with ${metricCells.length} metric cells on page ${pageNum}`);
              
              // Extract metric values
              const metrics = [];
              const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
              const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
              const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
              
              // Map available metrics to our standard metrics
              // We'll create metrics based on position
              for (let i = 0; i < Math.min(metricCells.length, metricNames.length); i++) {
                const cell = metricCells[i];
                const value = extractNumeric(cell.str);
                
                metrics.push({
                  name: metricNames[i],
                  value: value,
                  target: metricTargets[i],
                  unit: metricUnits[i],
                  status: determineStatus(metricNames[i], value)
                });
              }
              
              if (metrics.length > 0) {
                allDrivers.push({
                  name: driverId,
                  status: "active",
                  metrics
                });
                driversFoundOnPage++;
              }
            }
          }
        }
        
        console.log(`Found ${driversFoundOnPage} drivers on page ${pageNum} using direct ID matching`);
      }
    }
    
    // Alternative approach - look for rows of aligned cells that may form a table
    if (page.rows && page.rows.length > 0) {
      console.log(`Trying table row detection with ${page.rows.length} rows on page ${pageNum}`);
      const driversFromRows = detectTableRows(page.items, page.rows);
      
      let newDriversFound = 0;
      for (const driver of driversFromRows) {
        if (!allDrivers.some(d => d.name === driver.name)) {
          allDrivers.push(driver);
          newDriversFound++;
        }
      }
      
      if (newDriversFound > 0) {
        console.log(`Found ${newDriversFound} additional drivers from table rows on page ${pageNum}`);
      }
    }
  }
  
  // If we found multiple drivers with the same ID, keep only the one with the most metrics
  const uniqueDrivers = deduplicateDrivers(allDrivers);
  
  console.log(`Found ${uniqueDrivers.length} unique drivers in grid table after processing all pages`);
  return uniqueDrivers;
}

/**
 * Detect table rows by processing rows data
 */
function detectTableRows(items: any[], rows: any[][]): DriverKPI[] {
  const drivers: DriverKPI[] = [];
  
  // Process each row that might be a data row
  for (const row of rows) {
    // Skip rows that are too short
    if (row.length < 4) continue;
    
    // Check if the first cell looks like a driver ID
    const firstCell = row[0];
    if (!firstCell || !firstCell.str) continue;
    
    const cellText = firstCell.str.trim();
    
    if (cellText.startsWith('A') && cellText.length >= 6) {
      // Looks like a driver ID - assume this is a data row
      const numericCells = row.slice(1).filter(cell => 
        cell && cell.str && isNumeric(cell.str.trim())
      );
      
      if (numericCells.length >= 2) {
        // Create metrics based on position
        const metrics = [];
        const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
        const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
        const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
        
        for (let i = 0; i < Math.min(numericCells.length, metricNames.length); i++) {
          const cell = numericCells[i];
          const value = extractNumeric(cell.str);
          
          metrics.push({
            name: metricNames[i],
            value: value,
            target: metricTargets[i],
            unit: metricUnits[i],
            status: determineStatus(metricNames[i], value)
          });
        }
        
        if (metrics.length > 0) {
          drivers.push({
            name: cellText,
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
 * Remove duplicate drivers, keeping the one with the most metrics
 */
function deduplicateDrivers(drivers: DriverKPI[]): DriverKPI[] {
  const driverMap = new Map<string, DriverKPI>();
  
  for (const driver of drivers) {
    const existingDriver = driverMap.get(driver.name);
    
    if (!existingDriver || driver.metrics.length > existingDriver.metrics.length) {
      driverMap.set(driver.name, driver);
    }
  }
  
  return Array.from(driverMap.values());
}
