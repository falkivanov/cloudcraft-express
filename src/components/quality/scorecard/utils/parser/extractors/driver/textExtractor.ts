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
          metrics: createAllStandardMetrics()
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
