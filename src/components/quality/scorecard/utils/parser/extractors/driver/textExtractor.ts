
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
  
  console.log("Extrahierte Header-Namen in originaler Reihenfolge:", headerNames);
  
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
        const metrics = [];
        
        // Process each value in the line (skip the first one which is the driver ID)
        // Behalte die originale Reihenfolge der Header bei
        for (let j = 1; j < values.length && j <= headerNames.length; j++) {
          const headerName = headerNames[j-1];
          const value = values[j];
          
          let parsedValue;
          let status = "none";
          
          if (value === "-") {
            parsedValue = 0;
          } else {
            // Handle numeric values, possibly with percentage sign
            let numericValue = value;
            if (typeof numericValue === 'string' && numericValue.endsWith('%')) {
              numericValue = numericValue.replace('%', '');
            }
            
            parsedValue = parseFloat(numericValue);
            
            // Handle percentages over 1 (convert from 100-scale to 0-1 scale if needed)
            if ((headerName === "DCR" || 
                 headerName === "POD" || 
                 headerName === "CC" || 
                 headerName === "CDF") && 
                parsedValue > 100) {
              parsedValue = parsedValue / 100;
            }
            
            if (isNaN(parsedValue)) {
              parsedValue = 0;
            }
            
            status = determineMetricStatus(headerName, parsedValue);
          }
          
          // Bestimme die passenden Targets für die Metriken
          let target = 0;
          switch (headerName) {
            case "DCR": target = 98.5; break;
            case "DNR DPMO": target = 1500; break;
            case "LoR DPMO": target = 1500; break;
            case "POD": target = 98; break;
            case "CC": target = 95; break;
            case "CDF": target = 95; break;
            case "DEX": target = 95; break;
            default: target = 0;
          }
          
          // Bestimme die Einheit
          let unit = "";
          switch (headerName) {
            case "DCR": unit = "%"; break;
            case "DNR DPMO": unit = "DPMO"; break;
            case "LoR DPMO": unit = "DPMO"; break;
            case "POD": unit = "%"; break;
            case "CC": unit = "%"; break;
            case "CDF": unit = "%"; break;
            case "CE": unit = ""; break;
            case "DEX": unit = "%"; break;
            case "Delivered": unit = ""; break;
            default: unit = "";
          }
          
          metrics.push({
            name: headerName,
            value: parsedValue,
            target: target,
            unit: unit,
            status: status
          });
        }
        
        console.log(`Processing driver ${driverId} with ${metrics.length} metrics`);
        
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
