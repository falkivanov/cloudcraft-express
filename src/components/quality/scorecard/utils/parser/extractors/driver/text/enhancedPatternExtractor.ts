
import { DriverKPI } from '../../../../../types';
import { determineStatus } from '../../../../helpers/statusHelper';
import { determineMetricStatus } from '../utils/metricStatus';
import { createAllStandardMetrics } from '../utils/metricUtils';

/**
 * Extract drivers using enhanced regex patterns designed for different scorecard formats
 * @param text Text content from which to extract driver data
 * @param options Configuration options for the extraction
 * @returns Array of extracted DriverKPI objects
 */
export const extractDriversWithEnhancedPatterns = (
  text: string, 
  options: { prioritizeAIds?: boolean } = {}
): DriverKPI[] => {
  console.log("Extracting drivers with enhanced pattern matching");
  const drivers: DriverKPI[] = [];
  const processedIds = new Set<string>();
  
  // Detect table format - check if it has LoR DPMO column
  const hasLoRColumn = text.toLowerCase().includes("lor dpmo");
  console.log(`Enhanced pattern extractor detected ${hasLoRColumn ? "new format with" : "standard format without"} LoR DPMO column`);
  
  // Find all driver rows with metrics using regex
  // This pattern looks for IDs followed by multiple numbers or percentages
  const pattern = options.prioritizeAIds 
    ? /\b(A[A-Z0-9]{5,13})\s+([\d.]+)\s+([\d.]+(?:%)?)\s+([\d.]+)\s+(?:([\d.]+)\s+)?([\d.]+(?:%)?)\s+([\d.]+(?:%)?)\s+([\d.]+)\s+([\d.]+(?:%)?)/ 
    : /\b(A[A-Z0-9]{1,13}|TR-\d{3})\s+([\d.]+)\s+([\d.]+(?:%)?)\s+([\d.]+)\s+(?:([\d.]+)\s+)?([\d.]+(?:%)?)\s+([\d.]+(?:%)?)\s+([\d.]+)\s+([\d.]+(?:%)?)/;
  
  const rows = text.match(new RegExp(pattern, 'g')) || [];
  
  // If we don't find any rows with the first pattern, try some alternatives
  if (rows.length === 0) {
    // Alternative pattern to match LOR column format
    if (hasLoRColumn) {
      console.log("Trying alternative pattern for tables with LoR DPMO column");
      const lorPattern = /\b(A[A-Z0-9]{5,13})\s+([\d.]+)\s+([\d.]+(?:%)?)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+(?:%)?)\s+([\d.]+(?:%)?)\s+([\d.]+)\s+([\d.]+(?:%)?)/g;
      const lorMatches = text.match(lorPattern) || [];
      
      for (const match of lorMatches) {
        const parts = match.trim().split(/\s+/);
        if (parts.length >= 9) {
          const driverId = parts[0];
          
          // Skip if we've already processed this driver
          if (processedIds.has(driverId)) continue;
          
          try {
            const metrics = [
              {
                name: "Delivered",
                value: parseFloat(parts[1]),
                target: 0,
                status: "fair"
              },
              {
                name: "DCR",
                value: parseFloat(parts[2].replace('%', '')),
                target: 98.5,
                status: determineMetricStatus("DCR", parseFloat(parts[2]))
              },
              {
                name: "DNR DPMO",
                value: parseFloat(parts[3]),
                target: 1500,
                status: determineMetricStatus("DNR DPMO", parseFloat(parts[3]))
              },
              // Skip LoR DPMO (parts[4])
              {
                name: "POD",
                value: parseFloat(parts[5].replace('%', '')),
                target: 98,
                status: determineMetricStatus("POD", parseFloat(parts[5]))
              },
              {
                name: "CC",
                value: parseFloat(parts[6].replace('%', '')),
                target: 95,
                status: determineMetricStatus("CC", parseFloat(parts[6]))
              },
              {
                name: "CE",
                value: parseFloat(parts[7]),
                target: 0,
                status: determineMetricStatus("CE", parseFloat(parts[7]))
              },
              {
                name: "DEX",
                value: parseFloat(parts[8].replace('%', '')),
                target: 95,
                status: determineMetricStatus("DEX", parseFloat(parts[8]))
              }
            ];
            
            const driver: DriverKPI = {
              name: driverId,
              status: "active",
              metrics: createAllStandardMetrics(metrics)
            };
            
            drivers.push(driver);
            processedIds.add(driverId);
            console.log(`Added driver ${driverId} with LoR format pattern`);
          } catch (error) {
            console.error(`Error processing driver ${driverId} with LoR pattern:`, error);
          }
        }
      }
    } else {
      // Try alternative pattern for standard format
      console.log("Trying alternative pattern for standard table format");
      const standardPattern = /\b(A[A-Z0-9]{5,13}|TR-\d{3})\s+([\d.]+)\s+([\d.]+(?:%)?)\s+([\d.]+)\s+([\d.]+(?:%)?)\s+([\d.]+(?:%)?)\s+([\d.]+)\s+([\d.]+(?:%)?)/g;
      const standardMatches = text.match(standardPattern) || [];
      
      for (const match of standardMatches) {
        const parts = match.trim().split(/\s+/);
        if (parts.length >= 8) {
          const driverId = parts[0];
          
          // Skip if we've already processed this driver
          if (processedIds.has(driverId)) continue;
          
          try {
            const metrics = [
              {
                name: "Delivered",
                value: parseFloat(parts[1]),
                target: 0,
                status: "fair"
              },
              {
                name: "DCR",
                value: parseFloat(parts[2].replace('%', '')),
                target: 98.5,
                status: determineMetricStatus("DCR", parseFloat(parts[2]))
              },
              {
                name: "DNR DPMO",
                value: parseFloat(parts[3]),
                target: 1500,
                status: determineMetricStatus("DNR DPMO", parseFloat(parts[3]))
              },
              {
                name: "POD",
                value: parseFloat(parts[4].replace('%', '')),
                target: 98,
                status: determineMetricStatus("POD", parseFloat(parts[4]))
              },
              {
                name: "CC",
                value: parseFloat(parts[5].replace('%', '')),
                target: 95,
                status: determineMetricStatus("CC", parseFloat(parts[5]))
              },
              {
                name: "CE",
                value: parseFloat(parts[6]),
                target: 0,
                status: determineMetricStatus("CE", parseFloat(parts[6]))
              },
              {
                name: "DEX",
                value: parseFloat(parts[7].replace('%', '')),
                target: 95,
                status: determineMetricStatus("DEX", parseFloat(parts[7]))
              }
            ];
            
            const driver: DriverKPI = {
              name: driverId,
              status: "active",
              metrics: createAllStandardMetrics(metrics)
            };
            
            drivers.push(driver);
            processedIds.add(driverId);
            console.log(`Added driver ${driverId} with standard format pattern`);
          } catch (error) {
            console.error(`Error processing driver ${driverId} with standard pattern:`, error);
          }
        }
      }
    }
  } else {
    // Process matches from the first pattern attempt
    console.log(`Found ${rows.length} driver rows with primary pattern`);
    
    for (const row of rows) {
      const match = row.match(pattern);
      if (!match) continue;
      
      const driverId = match[1];
      
      // Skip if we've already processed this driver
      if (processedIds.has(driverId)) continue;
      
      try {
        // Determine if the row has LoR DPMO column based on capture groups
        // Typically match[5] will be undefined if LoR column doesn't exist
        const hasLorInRow = match.length > 5 && match[5] !== undefined;
        
        const metrics = [];
        
        // Always add these first three metrics
        metrics.push({
          name: "Delivered",
          value: parseFloat(match[2]),
          target: 0,
          status: "fair"
        });
        
        metrics.push({
          name: "DCR",
          value: parseFloat(match[3].replace('%', '')),
          target: 98.5,
          status: determineMetricStatus("DCR", parseFloat(match[3]))
        });
        
        metrics.push({
          name: "DNR DPMO",
          value: parseFloat(match[4]),
          target: 1500,
          status: determineMetricStatus("DNR DPMO", parseFloat(match[4]))
        });
        
        // Skip LoR DPMO if present
        
        // Add remaining metrics, adjusting indexes based on whether LoR column exists
        if (hasLorInRow) {
          // Skip the LoR column (match[5]) and continue with POD
          const podIndex = 6;
          const ccIndex = 7;
          const ceIndex = 8;
          const dexIndex = 9;
          
          if (match[podIndex]) {
            metrics.push({
              name: "POD",
              value: parseFloat(match[podIndex].replace('%', '')),
              target: 98,
              status: determineMetricStatus("POD", parseFloat(match[podIndex]))
            });
          }
          
          if (match[ccIndex]) {
            metrics.push({
              name: "CC",
              value: parseFloat(match[ccIndex].replace('%', '')),
              target: 95,
              status: determineMetricStatus("CC", parseFloat(match[ccIndex]))
            });
          }
          
          if (match[ceIndex]) {
            metrics.push({
              name: "CE",
              value: parseFloat(match[ceIndex]),
              target: 0,
              status: determineMetricStatus("CE", parseFloat(match[ceIndex]))
            });
          }
          
          if (match[dexIndex]) {
            metrics.push({
              name: "DEX",
              value: parseFloat(match[dexIndex].replace('%', '')),
              target: 95,
              status: determineMetricStatus("DEX", parseFloat(match[dexIndex]))
            });
          }
        } else {
          // Standard format without LoR column
          const podIndex = 5;
          const ccIndex = 6;
          const ceIndex = 7;
          const dexIndex = 8;
          
          if (match[podIndex]) {
            metrics.push({
              name: "POD",
              value: parseFloat(match[podIndex].replace('%', '')),
              target: 98,
              status: determineMetricStatus("POD", parseFloat(match[podIndex]))
            });
          }
          
          if (match[ccIndex]) {
            metrics.push({
              name: "CC",
              value: parseFloat(match[ccIndex].replace('%', '')),
              target: 95,
              status: determineMetricStatus("CC", parseFloat(match[ccIndex]))
            });
          }
          
          if (match[ceIndex]) {
            metrics.push({
              name: "CE",
              value: parseFloat(match[ceIndex]),
              target: 0,
              status: determineMetricStatus("CE", parseFloat(match[ceIndex]))
            });
          }
          
          if (match[dexIndex]) {
            metrics.push({
              name: "DEX",
              value: parseFloat(match[dexIndex].replace('%', '')),
              target: 95,
              status: determineMetricStatus("DEX", parseFloat(match[dexIndex]))
            });
          }
        }
        
        const driver: DriverKPI = {
          name: driverId,
          status: "active",
          metrics: createAllStandardMetrics(metrics)
        };
        
        drivers.push(driver);
        processedIds.add(driverId);
        console.log(`Added driver ${driverId} with ${metrics.length} metrics`);
      } catch (error) {
        console.error(`Error processing driver ${driverId}:`, error);
      }
    }
  }
  
  console.log(`Enhanced pattern extraction found ${drivers.length} drivers`);
  return drivers;
};
