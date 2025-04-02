
import { DriverKPI } from "../../../../types";
import { generateSampleDrivers } from "./sampleData";
import { ensureAllMetrics } from "./utils/metricUtils";

/**
 * Extrahiere Fahrer-KPIs aus dem Textinhalt eines PDFs
 * mit Fokus auf DSP WEEKLY SUMMARY Format
 */
export const extractDriverKPIsFromText = (text: string): DriverKPI[] => {
  console.log("Extrahiere Fahrer-KPIs aus dem Textinhalt");
  
  // Zuerst prüfen, ob es sich um ein DSP WEEKLY SUMMARY handelt
  if (text.includes("DSP WEEKLY SUMMARY")) {
    console.log("'DSP WEEKLY SUMMARY' gefunden, beginne mit Extraktion");
    
    const drivers = extractDriversFromDSPWeeklySummary(text);
    if (drivers.length > 0) {
      console.log(`${drivers.length} Fahrer aus DSP Weekly Summary extrahiert`);
      return ensureAllMetrics(drivers);
    }
  }
  
  // Wenn keine Fahrer gefunden wurden, verwende Beispieldaten
  console.warn("Keine Fahrer gefunden, verwende Beispieldaten");
  return generateSampleDrivers();
};

/**
 * Extrahiere Fahrer aus einem DSP Weekly Summary formatierten Text
 */
const extractDriversFromDSPWeeklySummary = (text: string): DriverKPI[] => {
  const drivers: DriverKPI[] = [];
  
  // Teile den Text in Zeilen auf
  const lines = text.split(/\r?\n/);
  
  // Suche nach der Kopfzeile der Tabelle
  let headerLineIndex = -1;
  const headerPattern = /Transporter\s+ID|Transport\s+ID|Driver\s+ID/i;
  
  for (let i = 0; i < lines.length; i++) {
    if (headerPattern.test(lines[i])) {
      headerLineIndex = i;
      console.log(`Tabellenkopf gefunden in Zeile ${i}: ${lines[i]}`);
      break;
    }
  }
  
  if (headerLineIndex === -1) {
    console.log("Konnte Tabellenkopf nicht finden");
    return drivers;
  }
  
  // Identifiziere die Spalten im Header
  const headerColumns = lines[headerLineIndex].split(/\s+/).filter(Boolean);
  console.log("Gefundene Spalten:", headerColumns);
  
  // Verarbeite Fahrerzeilen nach dem Header
  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Überspringe leere Zeilen oder Seitenumbrüche
    if (line.length < 5 || line.includes("Page") || line.includes("Seite")) {
      continue;
    }
    
    // Suche nach Fahrer-IDs, die mit 'A' beginnen
    const driverIdMatch = line.match(/^(A[A-Z0-9]{5,})/);
    if (!driverIdMatch) continue;
    
    const driverId = driverIdMatch[1];
    console.log(`Mögliche Fahrer-ID gefunden: ${driverId}`);
    
    // Extrahiere Zahlenwerte aus der Zeile
    const values = line.match(/(\d+(?:\.\d+)?%?|\d+)/g) || [];
    
    if (values.length >= 3) { // Mindestens 3 Metriken
      const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
      const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
      const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
      
      const metrics = [];
      
      // Werte den Metriken zuordnen, dabei den ersten Wert überspringen,
      // falls er Teil der ID ist oder ein numerischer Teil der ID
      const valueStartIndex = (driverId.match(/\d+/)) ? 1 : 0;
      
      for (let j = valueStartIndex; j < values.length && j - valueStartIndex < metricNames.length; j++) {
        const value = values[j];
        const metricIndex = j - valueStartIndex;
        
        // Numerischen Wert extrahieren, Prozentzeichen und Kommas berücksichtigen
        let numValue = parseFloat(value.replace('%', '').replace(',', '.'));
        
        metrics.push({
          name: metricNames[metricIndex],
          value: numValue,
          target: metricTargets[metricIndex],
          unit: metricUnits[metricIndex]
        });
      }
      
      // Fahrer nur hinzufügen, wenn genug Metriken gefunden wurden
      if (metrics.length >= 3) {
        drivers.push({
          name: driverId,
          status: "active",
          metrics
        });
        console.log(`Fahrer ${driverId} mit ${metrics.length} Metriken hinzugefügt`);
      }
    }
  }
  
  console.log(`Insgesamt ${drivers.length} Fahrer gefunden`);
  return drivers;
};
