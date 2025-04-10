
import { determineStatus } from '@/components/quality/scorecard/utils/helpers/statusHelper';
import { DriverKPI } from '@/components/quality/scorecard/types';
import { extractNumeric, isNumeric } from '../../extractors/driver/structural/valueExtractor';
import { determineMetricStatus } from '../../extractors/driver/utils/metricStatus';

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
    const driverIdIndex = headerIndexes["Transporter ID"] !== undefined ? 
      headerIndexes["Transporter ID"] : 0;
    
    if (driverIdIndex < row.length) {
      const driverId = (row[driverIdIndex]?.str || "").trim();
      
      // Skip if driver ID is empty or doesn't look like a valid ID
      // Driver IDs now start with 'A' and are alphanumeric with length >= 6
      if (!driverId || driverId.length < 6 || !driverId.startsWith('A')) {
        // Try looking for the first entry in the row that matches the driver ID pattern
        const potentialDriverId = row.find(cell => 
          (cell.str || "").trim().startsWith('A') && (cell.str || "").trim().length >= 6
        );
        
        if (potentialDriverId) {
          const newDriverId = potentialDriverId.str.trim();
          console.log(`Found potential driver ID: ${newDriverId} in row despite wrong column index`);
          processDriverWithId(newDriverId, row, headerIndexes, drivers);
        }
        continue;
      }
      
      console.log(`Processing driver: ${driverId}`);
      processDriverWithId(driverId, row, headerIndexes, drivers);
    } else {
      // Try to find a driver ID in the row anyway
      const firstColumn = row[0]?.str.trim();
      if (firstColumn && firstColumn.startsWith('A') && firstColumn.length >= 6) {
        console.log(`Found driver ID in first column: ${firstColumn} despite missing header index`);
        
        // Create metrics from the remaining columns
        const metrics = [];
        const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
        const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
        const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
        
        let metricIndex = 0;
        for (let j = 1; j < row.length && metricIndex < metricNames.length; j++) {
          const cellText = (row[j]?.str || "").trim();
          
          if (isNumeric(cellText) || cellText === "-") {
            const value = cellText === "-" ? 0 : extractNumeric(cellText);
            metrics.push({
              name: metricNames[metricIndex],
              value: value,
              target: metricTargets[metricIndex],
              unit: metricUnits[metricIndex],
              status: determineStatus(metricNames[metricIndex], value)
            });
            metricIndex++;
          }
        }
        
        if (metrics.length > 0) {
          drivers.push({
            name: firstColumn,
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
 * Helper function to process a driver with known ID
 */
function processDriverWithId(driverId: string, row: any[], headerIndexes: Record<string, number>, drivers: DriverKPI[]): void {
  // Sammle alle numerischen Werte aus der Zeile
  const numericValues: {value: number, x: number}[] = [];
  
  // Erfasse alle numerischen Werte mit ihren x-Koordinaten
  for (const cell of row) {
    const valueStr = (cell?.str || "").trim();
    if (valueStr && (isNumeric(valueStr) || valueStr === "-")) {
      const value = valueStr === "-" ? 0 : extractNumeric(valueStr);
      numericValues.push({
        value,
        x: cell.x
      });
    }
  }
  
  // Sortiere numerische Werte von links nach rechts basierend auf x-Koordinate
  numericValues.sort((a, b) => a.x - b.x);
  
  // Metriken basierend auf der Position erstellen (von links nach rechts)
  const metrics = [];
  const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
  const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
  const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
  
  // Maximal so viele Metriken wie verfügbare Werte oder Metriknamen
  const maxMetrics = Math.min(numericValues.length, metricNames.length);
  
  for (let i = 0; i < maxMetrics; i++) {
    const value = numericValues[i].value;
    
    metrics.push({
      name: metricNames[i],
      value: value,
      target: metricTargets[i],
      unit: metricUnits[i],
      status: determineStatus(metricNames[i], value)
    });
  }
  
  // Nur Fahrer hinzufügen, wenn wenigstens einige Metriken gefunden wurden
  if (metrics.length > 0) {
    drivers.push({
      name: driverId,
      status: "active",
      metrics
    });
  }
}

/**
 * Process a single driver row (for page 4)
 */
export function processDriverRow(row: any[]): DriverKPI | null {
  // First item should be driver ID
  const driverId = (row[0]?.str || "").trim();
  
  // Driver IDs start with 'A' and are alphanumeric with at least 6 characters
  if (!driverId || driverId.length < 6 || !driverId.startsWith('A')) return null;
  
  console.log(`Processing standalone driver row: ${driverId} with ${row.length} columns`);
  
  // Sammle alle numerischen Werte aus der Zeile mit x-Koordinaten
  const numericValues: {value: number, x: number}[] = [];
  
  for (const cell of row) {
    if (cell?.str && cell.str !== driverId) {
      const valueStr = cell.str.trim();
      if (valueStr && (isNumeric(valueStr) || valueStr === "-")) {
        const value = valueStr === "-" ? 0 : extractNumeric(valueStr);
        numericValues.push({
          value,
          x: cell.x
        });
      }
    }
  }
  
  // Sortiere nach x-Koordinate
  numericValues.sort((a, b) => a.x - b.x);
  
  if (numericValues.length < 3) return null;
  
  // Map the numeric values to metrics in the expected order
  const metrics = [];
  const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
  const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
  const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
  
  // Nur so viele Metriken wie wir Werte oder Namen haben
  const maxMetrics = Math.min(numericValues.length, metricNames.length);
  
  for (let i = 0; i < maxMetrics; i++) {
    const value = numericValues[i].value;
    
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

// Hilfsfunktionen, die unverändert bleiben
function getTargetForMetric(metricName: string): number {
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

function getFallbackCellIndex(metricName: string): number {
  switch (metricName) {
    case "Delivered": return 1;
    case "DCR": return 2;
    case "DNR DPMO": return 3;
    case "POD": return 4;
    case "CC": return 5;
    case "CE": return 6;
    case "DEX": return 7;
    default: return 0;
  }
}
