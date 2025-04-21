
import { determineMetricStatus } from './utils/metricStatus';
import { createAllStandardMetrics } from './utils/metricUtils';

export const extractDriverKPIsFromText = (text: string) => {
  const dspSummaryIndex = text.indexOf("DSP WEEKLY SUMMARY");
  
  if (dspSummaryIndex === -1) {
    console.log("DSP WEEKLY SUMMARY nicht gefunden");
    return [];
  }
  
  const relevantText = text.substring(dspSummaryIndex);
  
  // Updated header pattern to match what's in the image - looking for the header row with all columns
  const headerPattern = /Transporter\s*ID\s*[\s|]*Delivered\s*[\s|]*DCR\s*[\s|]*DNR\s*DPMO\s*[\s|]*LoR\s*DPMO\s*[\s|]*POD\s*[\s|]*CC\s*[\s|]*CE\s*[\s|]*CDF/i;
  const headerMatch = relevantText.match(headerPattern);
  
  if (!headerMatch) {
    console.log("Tabellenüberschrift nicht gefunden");
    // Try a more flexible pattern in case the header format varies
    const flexibleHeaderPattern = /Transporter\s*ID.*Delivered.*DCR.*DNR.*DPMO/i;
    const flexibleMatch = relevantText.match(flexibleHeaderPattern);
    if (!flexibleMatch) {
      return [];
    }
  }
  
  const lines = relevantText.split('\n');
  
  // Find the line that contains the table header
  let tableStartIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("Transporter ID") && 
        (lines[i].includes("Delivered") || lines[i].includes("DCR"))) {
      tableStartIndex = i;
      console.log("Found table header at line:", i, lines[i]);
      break;
    }
  }
  
  if (tableStartIndex === -1) {
    console.log("Tabellenanfang nicht gefunden");
    return [];
  }
  
  const drivers = [];
  // Start processing from the line after the header
  for (let i = tableStartIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for lines that start with A-prefixed driver IDs (like A10PTFSF16G64)
    if (line.match(/^A[A-Z0-9]+/)) {
      // Split the line by whitespace or tab characters to get the individual values
      const values = line.split(/\s+/).filter(val => val !== '');
      
      console.log(`Analyzing line with ${values.length} values:`, values);
      
      // Check if we have enough values to work with
      if (values.length >= 2) {
        const driverId = values[0];
        
        // Create arrays to store metrics
        const metricNames = ["Delivered", "DCR", "DNR DPMO", "LoR DPMO", "POD", "CC", "CE", "CDF"];
        const metricTargets = [0, 98.5, 1500, 1500, 98, 95, 0, 95];
        const metricUnits = ["", "%", "DPMO", "DPMO", "%", "%", "", "%"];
        const metricValues = [];
        const metricStatuses = [];
        
        // Process each value in the line
        for (let j = 1; j < values.length && j <= 8; j++) {
          const value = values[j];
          const metricIndex = j - 1;
          
          if (value === "-") {
            // Handle dash values
            metricValues.push(0);
            metricStatuses.push("none");
          } else {
            // Handle numeric values, possibly with percentage sign
            let numericValue = value;
            if (typeof numericValue === 'string' && numericValue.endsWith('%')) {
              numericValue = numericValue.replace('%', '');
            }
            
            const parsedValue = parseFloat(numericValue);
            
            // Handle percentages over 1 (convert from 100-scale to 0-1 scale if needed)
            let finalValue = parsedValue;
            if ((metricNames[metricIndex] === "DCR" || 
                 metricNames[metricIndex] === "POD" || 
                 metricNames[metricIndex] === "CC" || 
                 metricNames[metricIndex] === "CDF") && 
                parsedValue > 100) {
              finalValue = parsedValue / 100;
            }
            
            metricValues.push(isNaN(finalValue) ? 0 : finalValue);
            metricStatuses.push(determineMetricStatus(metricNames[metricIndex], finalValue));
          }
        }
        
        // Fill in any missing metrics with defaults (for shorter rows)
        while (metricValues.length < 8) {
          metricValues.push(0);
          metricStatuses.push("none");
        }
        
        console.log(`Processing driver ${driverId} with ${metricValues.length} values`);
        
        // Create driver metrics objects
        const metrics = metricNames.map((name, index) => ({
          name,
          value: metricValues[index],
          target: metricTargets[index],
          unit: metricUnits[index],
          status: metricStatuses[index]
        }));
        
        const driver = {
          id: driverId,
          name: driverId,
          metrics,
          status: "active"
        };
        
        drivers.push(driver);
        console.log(`Processed driver: ${driverId}`);
      } else {
        console.log(`Line has insufficient data: ${values.length} values`, line);
      }
    }
  }
  
  console.log(`Extrahiert: ${drivers.length} Fahrer aus DSP WEEKLY SUMMARY Tabelle`);
  
  const enhancedDrivers = drivers.map(driver => ({
    ...driver,
    metrics: createAllStandardMetrics(driver.metrics)
  }));
  
  return enhancedDrivers;
};
