import { DriverKPI } from '../../../../../types';
import { determineStatus } from '../../../../helpers/statusHelper';
import { extractNumeric, isNumeric } from '../structural/valueExtractor';

/**
 * Find a grid-based driver table in the PDF and extract drivers
 */
export function findDriverTable(pageData: Record<number, any>): DriverKPI[] {
  console.log("Looking for driver table grid in PDF pages");
  
  // Check pages 2, 3, and 4 which typically contain driver tables
  const relevantPages = [2, 3, 4].filter(num => pageData[num]);
  const allDrivers: DriverKPI[] = [];
  
  for (const pageNum of relevantPages) {
    console.log(`Analyzing page ${pageNum} for driver table grid`);
    const page = pageData[pageNum];
    if (!page || !page.items || page.items.length === 0) continue;
    
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
      const driverIdCells = page.items.filter(item => 
        (item.str || "").trim().startsWith('A') && 
        (item.str || "").trim().length >= 6
      );
      
      console.log(`Found ${driverIdCells.length} potential driver IDs on page ${pageNum}`);
      
      if (driverIdCells.length >= 3) {
        // Process each driver ID cell as a starting point for a row
        for (const idCell of driverIdCells) {
          const driverId = idCell.str.trim();
          
          // Find cells that are aligned horizontally with the driver ID
          // with a small vertical tolerance (±5 pixels)
          const rowCells = page.items.filter(item => 
            Math.abs(item.y - idCell.y) < 5 &&
            item !== idCell
          ).sort((a, b) => a.x - b.x);
          
          if (rowCells.length >= 3) {
            // Filter out non-numeric cells
            const metricCells = rowCells.filter(cell => 
              isNumeric((cell.str || "").trim())
            );
            
            if (metricCells.length >= 3) {
              console.log(`Found driver ${driverId} with ${metricCells.length} metric cells`);
              
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
              }
            }
          }
        }
      }
    }
    
    // Alternative approach - look for rows of aligned cells that may form a table
    if (allDrivers.length < 3) {
      console.log("Trying alternative table detection approach on page " + pageNum);
      const driversFromRows = detectTableRows(page.items);
      allDrivers.push(...driversFromRows);
    }
  }
  
  // If we found multiple drivers with the same ID, keep only the one with the most metrics
  const uniqueDrivers = deduplicateDrivers(allDrivers);
  
  console.log(`Found ${uniqueDrivers.length} unique drivers in grid table`);
  return uniqueDrivers;
}

/**
 * Detect table rows by grouping cells with similar y-coordinates
 */
function detectTableRows(items: any[]): DriverKPI[] {
  // Group items by y-coordinate with a small tolerance
  const yGroups: Record<number, any[]> = {};
  
  for (const item of items) {
    // Round y to the nearest 2 pixels to group items in the same row
    const yKey = Math.round(item.y / 2) * 2;
    
    if (!yGroups[yKey]) {
      yGroups[yKey] = [];
    }
    yGroups[yKey].push(item);
  }
  
  // Sort groups by y-coordinate (top to bottom)
  const sortedYKeys = Object.keys(yGroups)
    .map(Number)
    .sort((a, b) => b - a); // Reverse order (PDF y-coordinates increase from bottom to top)
  
  // Process each row that might be a data row
  const drivers: DriverKPI[] = [];
  
  for (const yKey of sortedYKeys) {
    const row = yGroups[yKey].sort((a, b) => a.x - b.x);
    
    // Skip rows that are too short
    if (row.length < 4) continue;
    
    // Check if the first cell looks like a driver ID
    const firstCell = row[0];
    const cellText = (firstCell.str || "").trim();
    
    if (cellText.startsWith('A') && cellText.length >= 6) {
      // Looks like a driver ID - assume this is a data row
      const numericCells = row.slice(1).filter(cell => 
        isNumeric((cell.str || "").trim())
      );
      
      if (numericCells.length >= 3) {
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
