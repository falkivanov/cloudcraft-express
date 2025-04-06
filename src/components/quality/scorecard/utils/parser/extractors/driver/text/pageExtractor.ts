
import { DriverKPI } from "../../../../../types";
import { determineMetricStatus } from "../utils/metricStatus";
import { createAllStandardMetrics } from "../utils/metricUtils";

/**
 * Extrahiert Fahrer-KPIs aus allen PDF-Seiten mit mehreren Ansätzen
 * @param allPageTexts Objekt mit Texten aller PDF-Seiten
 * @returns Array von DriverKPIs
 */
export function extractDriversFromAllPages(allPageTexts: Record<number, string>): DriverKPI[] {
  console.log("Extrahiere Fahrer aus allen PDF-Seiten");
  
  const drivers: DriverKPI[] = [];
  
  // Gehe durch alle Seiten
  for (const pageNum in allPageTexts) {
    const pageText = allPageTexts[pageNum];
    
    // Überspringe leere Seiten
    if (!pageText || pageText.trim() === "") continue;
    
    console.log(`Verarbeite Seite ${pageNum}`);
    
    // Versuche Fahrer aus dieser Seite zu extrahieren
    const pageDrivers = extractDriversFromPage(pageText);
    
    if (pageDrivers.length > 0) {
      console.log(`Gefunden: ${pageDrivers.length} Fahrer auf Seite ${pageNum}`);
      
      // Füge nur Fahrer hinzu, die wir noch nicht haben (basierend auf Namen)
      pageDrivers.forEach(driver => {
        if (!drivers.some(d => d.name === driver.name)) {
          drivers.push(driver);
        }
      });
    }
    
    // Wenn wir bereits eine bedeutende Anzahl von Fahrern haben, könnten wir aufhören
    if (drivers.length >= 20) {
      console.log(`Bereits ${drivers.length} Fahrer gefunden, beende Extraktion`);
      break;
    }
  }
  
  console.log(`Insgesamt extrahiert: ${drivers.length} Fahrer aus allen Seiten`);
  return drivers;
}

/**
 * Extrahiert Fahrer-KPIs aus einer einzelnen Seite
 * @param pageText Text einer PDF-Seite
 * @returns Array von DriverKPIs
 */
function extractDriversFromPage(pageText: string): DriverKPI[] {
  // Versuche mehrere Muster für Fahrer-IDs
  const patterns = [
    // Muster für klassische alphanumerische IDs
    /([A][A-Z0-9]{8,})\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/g,
    
    // Muster für TR-Codes
    /(TR[-\s]?\d{3,})\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/g,
    
    // Muster für IDs mit weniger Nachkommastellen
    /([A][A-Z0-9]{5,})\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/g,
    
    // Allgemeineres Muster für beliebige Fahrer-IDs mit numerischen Metriken
    /([A][A-Z0-9]{5,}|TR[-\s]?\d{3,})\s+(\d+)\s+(\d+(?:\.\d+)?)\s+(\d+)/g
  ];
  
  let allDrivers: DriverKPI[] = [];
  
  // Versuche alle Muster
  for (const pattern of patterns) {
    const matches = Array.from(pageText.matchAll(pattern));
    
    if (matches && matches.length > 0) {
      for (const match of matches) {
        const driverId = match[1].trim();
        
        // Extrahiere die numerischen Werte
        const values = match.slice(2).map(v => parseFloat(v.replace(/[^\d.]/g, '')));
        
        if (values.length >= 3 && !isNaN(values[0]) && !isNaN(values[1]) && !isNaN(values[2])) {
          // Erstelle Metriken basierend auf den extrahierten Werten
          const metrics = [];
          const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
          
          for (let i = 0; i < Math.min(values.length, metricNames.length); i++) {
            const value = values[i];
            metrics.push({
              name: metricNames[i],
              value,
              target: getTargetForMetric(metricNames[i]),
              unit: getUnitForMetric(metricNames[i]),
              status: determineMetricStatus(metricNames[i], value)
            });
          }
          
          // Füge nur hinzu, wenn wir diesen Fahrer noch nicht haben
          if (!allDrivers.some(d => d.name === driverId)) {
            allDrivers.push({
              name: driverId,
              status: "active",
              metrics: createAllStandardMetrics(metrics)
            });
          }
        }
      }
    }
  }
  
  // Wenn die obigen Methoden nicht funktionieren, versuche einen zeilenbasierten Ansatz
  if (allDrivers.length === 0) {
    allDrivers = extractDriversLineByLine(pageText);
  }
  
  return allDrivers;
}

/**
 * Extrahiert Fahrer-KPIs durch Analyse einzelner Zeilen
 * @param text Text der PDF
 * @returns Array von DriverKPIs
 */
function extractDriversLineByLine(text: string): DriverKPI[] {
  const lines = text.split('\n');
  const drivers: DriverKPI[] = [];
  
  // Suche nach Zeilen, die mit einem möglichen Fahrer-ID-Format beginnen
  for (const line of lines) {
    // Überprüfe verschiedene Fahrer-ID-Formate
    const idMatch = line.match(/^([A][A-Z0-9]{5,}|TR[-\s]?\d{3,})/);
    
    if (idMatch) {
      const driverId = idMatch[1].trim();
      
      // Extrahiere alle numerischen Werte aus der Zeile
      const numericMatches = line.match(/\b\d+(?:\.\d+)?%?\b/g);
      
      if (numericMatches && numericMatches.length >= 3) {
        // Erstelle Metriken aus den gefundenen numerischen Werten
        const metrics = [];
        const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
        
        // Verarbeite bis zu 7 numerische Werte (oder so viele wie wir haben)
        for (let i = 0; i < Math.min(numericMatches.length, metricNames.length); i++) {
          const valueStr = numericMatches[i].replace(/%/g, ''); // Entferne % Zeichen
          const value = parseFloat(valueStr);
          
          if (!isNaN(value)) {
            metrics.push({
              name: metricNames[i],
              value,
              target: getTargetForMetric(metricNames[i]),
              unit: getUnitForMetric(metricNames[i]),
              status: determineMetricStatus(metricNames[i], value)
            });
          }
        }
        
        if (metrics.length > 0) {
          // Füge nur hinzu, wenn wir diesen Fahrer noch nicht haben
          if (!drivers.some(d => d.name === driverId)) {
            drivers.push({
              name: driverId,
              status: "active",
              metrics: createAllStandardMetrics(metrics)
            });
          }
        }
      }
    }
  }
  
  return drivers;
}

/**
 * Bestimme den Zielwert für eine Metrik
 */
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

/**
 * Bestimme die Einheit für eine Metrik
 */
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
