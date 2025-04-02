
import { determineMetricStatus } from './utils/metricStatus';
import { createAllStandardMetrics } from './utils/metricUtils';

/**
 * Extrahiert Fahrer-KPIs aus dem Textinhalt mit Fokus auf den Bereich nach "DSP WEEKLY SUMMARY"
 * @param text Textinhalt, aus dem Fahrer-KPIs extrahiert werden sollen
 * @returns Array von DriverKPIs
 */
export const extractDriverKPIsFromText = (text: string) => {
  // Suche nach "DSP WEEKLY SUMMARY" als Anker im Text
  const dspSummaryIndex = text.indexOf("DSP WEEKLY SUMMARY");
  
  if (dspSummaryIndex === -1) {
    console.log("DSP WEEKLY SUMMARY nicht gefunden");
    return [];
  }
  
  // Extrahiere den Text nach "DSP WEEKLY SUMMARY"
  const relevantText = text.substring(dspSummaryIndex);
  
  // Identifiziere die Tabellenüberschrift
  const headerPattern = /Transport\s*ID\s*[,|]\s*Delivered\s*[,|]\s*DCR\s*[,|]\s*DNR\s*DPMO\s*[,|]\s*POD\s*[,|]\s*CC\s*[,|]\s*CE\s*[,|]\s*DEX/i;
  const headerMatch = relevantText.match(headerPattern);
  
  if (!headerMatch) {
    console.log("Tabellenüberschrift nicht gefunden");
    return [];
  }
  
  // Teile den Text in Zeilen
  const lines = relevantText.split('\n');
  
  // Finde den Tabellenanfang
  let tableStartIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (headerPattern.test(lines[i])) {
      tableStartIndex = i;
      break;
    }
  }
  
  if (tableStartIndex === -1) {
    console.log("Tabellenanfang nicht gefunden");
    return [];
  }
  
  // Extrahiere die Fahrerdaten ab der Zeile nach der Überschrift
  const drivers = [];
  for (let i = tableStartIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Überprüfe, ob die Zeile eine Fahrer-ID enthält (beginnt mit "A")
    if (line.match(/^A\w+/)) {
      // Extrahiere die Werte aus der Zeile
      const values = line.split(/[,|\t]+/).map(item => item.trim());
      
      if (values.length >= 8) {
        const [id, delivered, dcr, dnrDpmo, pod, cc, ce, dex] = values;
        
        // Erstelle ein Fahrerobjekt mit den extrahierten Werten
        const driver = {
          id,
          name: id, // Verwende ID als Name, wenn kein Name verfügbar ist
          metrics: [
            {
              name: "Delivered",
              value: parseFloat(delivered) || 0,
              target: 0,
              status: "neutral"
            },
            {
              name: "DCR",
              value: parseFloat(dcr) || 0,
              target: 98.5,
              status: determineMetricStatus("DCR", parseFloat(dcr) || 0)
            },
            {
              name: "DNR DPMO",
              value: parseFloat(dnrDpmo) || 0,
              target: 1500,
              status: determineMetricStatus("DNR DPMO", parseFloat(dnrDpmo) || 0)
            },
            {
              name: "POD",
              value: parseFloat(pod) || 0,
              target: 98,
              status: determineMetricStatus("POD", parseFloat(pod) || 0)
            },
            {
              name: "CC",
              value: parseFloat(cc) || 0,
              target: 95,
              status: determineMetricStatus("CC", parseFloat(cc) || 0)
            },
            {
              name: "CE",
              value: parseFloat(ce) || 0,
              target: 0,
              status: determineMetricStatus("CE", parseFloat(ce) || 0)
            },
            {
              name: "DEX",
              value: parseFloat(dex) || 0,
              target: 95,
              status: determineMetricStatus("DEX", parseFloat(dex) || 0)
            }
          ]
        };
        
        drivers.push(driver);
      }
    }
  }
  
  console.log(`Extrahiert: ${drivers.length} Fahrer aus DSP WEEKLY SUMMARY Tabelle`);
  
  // Stelle sicher, dass alle Fahrer vollständige Metriken haben
  const enhancedDrivers = drivers.map(driver => ({
    ...driver,
    metrics: createAllStandardMetrics(driver.metrics)
  }));
  
  return enhancedDrivers;
};
