
import { determineMetricStatus } from './utils/metricStatus';
import { createAllStandardMetrics } from './utils/metricUtils';

export const extractDriverKPIsFromText = (text: string) => {
  const dspSummaryIndex = text.indexOf("DSP WEEKLY SUMMARY");
  
  if (dspSummaryIndex === -1) {
    console.log("DSP WEEKLY SUMMARY nicht gefunden");
    return [];
  }
  
  const relevantText = text.substring(dspSummaryIndex);
  
  // Dynamisches Header-Pattern, das jegliche Header-Kombination erkennen kann
  const headerPattern = /Transporter\s*ID[\s|]*(.+)/i;
  const headerMatch = relevantText.match(headerPattern);
  
  if (!headerMatch) {
    console.log("Tabellenüberschrift nicht gefunden");
    return [];
  }
  
  // Extrahieren der Header-Namen für dynamische Spaltenbehandlung
  const headerLine = headerMatch[0];
  // Header-Namen extrahieren durch Aufteilen und Säubern
  const headerNames = headerLine.split(/\s{2,}|\t/)
    .map(h => h.trim())
    .filter(h => h && h !== "Transporter ID");
  
  console.log("Extrahierte Header-Namen:", headerNames);
  
  const lines = relevantText.split('\n');
  
  // Find the line that contains the table header
  let tableStartIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("Transporter ID") || 
        (lines[i].includes("Transporter") && lines[i].includes("ID"))) {
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
        
        // Dynamisch Metriken basierend auf extrahierten Header-Namen erstellen
        const metricValues = [];
        const metricStatuses = [];
        
        // Process each value in the line (skip the first one which is the driver ID)
        for (let j = 1; j < values.length && j <= headerNames.length; j++) {
          const value = values[j];
          
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
            if ((headerNames[j-1] === "DCR" || 
                 headerNames[j-1] === "POD" || 
                 headerNames[j-1] === "CC" || 
                 headerNames[j-1] === "CDF") && 
                parsedValue > 100) {
              finalValue = parsedValue / 100;
            }
            
            metricValues.push(isNaN(finalValue) ? 0 : finalValue);
            metricStatuses.push(determineMetricStatus(headerNames[j-1], finalValue));
          }
        }
        
        // Bestimme die passenden Targets und Units für die Metriken
        const metricTargets = headerNames.map(name => {
          switch (name) {
            case "DCR": return 98.5;
            case "DNR DPMO": return 1500;
            case "LoR DPMO": return 1500;
            case "POD": return 98;
            case "CC": return 95;
            case "CDF": return 95;
            default: return 0;
          }
        });
        
        const metricUnits = headerNames.map(name => {
          switch (name) {
            case "DCR": return "%";
            case "DNR DPMO": return "DPMO";
            case "LoR DPMO": return "DPMO";
            case "POD": return "%";
            case "CC": return "%";
            case "CDF": return "%";
            default: return "";
          }
        });
        
        console.log(`Processing driver ${driverId} with ${metricValues.length} values`);
        
        // Create driver metrics objects
        const metrics = headerNames.map((name, index) => ({
          name,
          value: metricValues[index] || 0,
          target: metricTargets[index],
          unit: metricUnits[index],
          status: metricStatuses[index] || "none"
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
  
  return drivers;
};
