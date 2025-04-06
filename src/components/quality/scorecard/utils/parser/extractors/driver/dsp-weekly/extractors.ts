
import { DriverKPI } from "../../../../../types";
import { determineMetricStatus } from "../utils/metricStatus";
import { createAllStandardMetrics } from "../utils/metricUtils";

/**
 * Extrahiert Fahrer-KPIs aus dem DSP WEEKLY SUMMARY Format
 * Diese Funktion ist spezialisiert auf das Standardformat der DSP WEEKLY SUMMARY Tabelle
 */
export function extractDriversFromDSPWeeklySummary(text: string): DriverKPI[] {
  console.log("Extrahiere Fahrer aus DSP WEEKLY SUMMARY Format");
  
  // Suche nach DSP WEEKLY SUMMARY als Anker im Text
  const dspSummaryIndex = text.indexOf("DSP WEEKLY SUMMARY");
  
  if (dspSummaryIndex === -1) {
    console.log("DSP WEEKLY SUMMARY nicht gefunden");
    return [];
  }
  
  // Extrahiere den Text nach DSP WEEKLY SUMMARY
  const relevantText = text.substring(dspSummaryIndex);
  
  // Teile den Text in Zeilen
  const lines = relevantText.split('\n');
  
  // Suche nach Tabellenüberschrift (verschiedene mögliche Formate)
  const headerPatterns = [
    /transport(?:er)?\s*id\s*[,|]\s*delivered\s*[,|]\s*dcr\s*[,|]\s*dnr\s*dpmo\s*[,|]\s*pod\s*[,|]\s*cc\s*[,|]\s*ce\s*[,|]\s*dex/i,
    /id\s*[,|]\s*delivered\s*[,|]\s*dcr\s*[,|]\s*dnr(?:\s*dpmo)?\s*[,|]\s*pod\s*[,|]\s*cc\s*[,|]\s*ce\s*[,|]\s*dex/i,
    /driver\s*id\s*[,|]\s*delivered\s*[,|]\s*dcr\s*[,|]\s*dnr\s*[,|]\s*pod\s*[,|]\s*cc\s*[,|]\s*ce\s*[,|]\s*dex/i
  ];
  
  // Finde Tabellenanfang
  let tableStartIndex = -1;
  let headerPattern = null;
  
  for (let i = 0; i < lines.length; i++) {
    for (const pattern of headerPatterns) {
      if (pattern.test(lines[i])) {
        tableStartIndex = i;
        headerPattern = pattern;
        break;
      }
    }
    if (tableStartIndex !== -1) break;
  }
  
  if (tableStartIndex === -1) {
    console.log("Tabellenanfang nicht gefunden");
    return [];
  }
  
  console.log(`Tabellenanfang gefunden bei Zeile ${tableStartIndex}: ${lines[tableStartIndex]}`);
  
  // Extrahiere die Fahrerdaten ab der Zeile nach der Überschrift
  const drivers = [];
  for (let i = tableStartIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Überprüfe, ob die Zeile eine Fahrer-ID enthält (beginnt mit "A" oder "TR")
    if (/^(A\w+|TR[-\s]?\d+)/i.test(line)) {
      // Extrahiere die Werte aus der Zeile
      const values = line.split(/[\s,|]+/).filter(item => item.trim() !== '');
      
      if (values.length >= 4) {  // Mindestens ID und einige Metriken
        const id = values[0].trim();
        
        // Versuche die Werte zu extrahieren (robust gegen verschiedene Formate)
        const metrics = [];
        const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
        
        // Extrahiere numerische Werte und weise sie den Metriken zu
        let metricIndex = 0;
        for (let j = 1; j < values.length && metricIndex < metricNames.length; j++) {
          const value = parseFloat(values[j].replace(/[^\d.]/g, ''));
          
          if (!isNaN(value)) {
            metrics.push({
              name: metricNames[metricIndex],
              value,
              target: getTargetForMetric(metricNames[metricIndex]),
              unit: getUnitForMetric(metricNames[metricIndex]),
              status: determineMetricStatus(metricNames[metricIndex], value)
            });
            metricIndex++;
          }
        }
        
        if (metrics.length > 0) {
          drivers.push({
            name: id,
            status: "active",
            metrics: createAllStandardMetrics(metrics)  // Stelle sicher, dass alle Standardmetriken vorhanden sind
          });
        }
      }
    }
    
    // Beende die Extraktion, wenn wir ein klares Ende der Tabelle gefunden haben
    if (/total|summary|end|^$/.test(line) && drivers.length > 0) {
      break;
    }
  }
  
  console.log(`Extrahiert: ${drivers.length} Fahrer aus DSP WEEKLY SUMMARY Tabelle`);
  return drivers;
}

/**
 * Extrahiert Fahrer-KPIs aus einer Tabelle mit fester Breite
 * Einige PDFs verwenden Tabellen mit fester Breite, die schwer zu parsen sind
 */
export function extractDriversFromFixedWidthTable(text: string): DriverKPI[] {
  console.log("Versuche Extraktion aus Tabelle mit fester Breite");
  
  // Suche nach DSP WEEKLY SUMMARY als Anker im Text
  const dspSummaryIndex = text.indexOf("DSP WEEKLY SUMMARY");
  
  if (dspSummaryIndex === -1) {
    return [];
  }
  
  // Extrahiere den Text nach DSP WEEKLY SUMMARY
  const relevantText = text.substring(dspSummaryIndex);
  
  // Teile den Text in Zeilen
  const lines = relevantText.split('\n');
  
  // Verbesserte Suche nach Fahrer-IDs in Zeilen
  const driverLinePattern = /^[A-Z][A-Z0-9]{6,}/;
  
  const drivers = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Überprüfe, ob die Zeile mit einer potenziellen Fahrer-ID beginnt
    if (driverLinePattern.test(line)) {
      // Extrahiere die Fahrer-ID (erstes Wort)
      const idMatch = line.match(/^([A-Z][A-Z0-9]{6,})/);
      if (!idMatch) continue;
      
      const driverId = idMatch[1].trim();
      
      // Nachdem wir die ID haben, extrahiere alle numerischen Werte aus der Zeile
      const numericMatches = line.match(/\b\d+(?:\.\d+)?%?\b/g);
      
      if (numericMatches && numericMatches.length >= 3) {
        // Erstelle Metriken aus den gefundenen numerischen Werten
        const metrics = [];
        const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
        
        // Verarbeite bis zu 7 numerische Werte (oder so viele wie wir haben)
        for (let j = 0; j < Math.min(numericMatches.length, metricNames.length); j++) {
          const valueStr = numericMatches[j].replace(/%/g, ''); // Entferne % Zeichen
          const value = parseFloat(valueStr);
          
          if (!isNaN(value)) {
            metrics.push({
              name: metricNames[j],
              value,
              target: getTargetForMetric(metricNames[j]),
              unit: getUnitForMetric(metricNames[j]),
              status: determineMetricStatus(metricNames[j], value)
            });
          }
        }
        
        if (metrics.length > 0) {
          drivers.push({
            name: driverId,
            status: "active",
            metrics: createAllStandardMetrics(metrics)  // Stelle sicher, dass alle Standardmetriken vorhanden sind
          });
        }
      }
    }
  }
  
  console.log(`Extrahiert: ${drivers.length} Fahrer aus Tabelle mit fester Breite`);
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
