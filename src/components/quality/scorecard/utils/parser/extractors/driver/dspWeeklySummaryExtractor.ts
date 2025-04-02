

import { DriverKPI } from "../../../../types";
import { determineMetricStatus } from "./utils/metricStatus";
import { createAllStandardMetrics } from "./utils/metricUtils";

/**
 * Spezialisierter Extraktor für die "DSP WEEKLY SUMMARY" Tabelle
 * Optimal angepasst für das Format wie im bereitgestellten Beispiel
 */
export function extractDriversFromDSPWeeklySummary(text: string): DriverKPI[] {
  console.log("Extrahiere Fahrer aus DSP WEEKLY SUMMARY Tabelle");
  
  // Suche nach dem DSP WEEKLY SUMMARY Header
  if (!text.includes("DSP WEEKLY SUMMARY")) {
    console.log("DSP WEEKLY SUMMARY nicht gefunden");
    return [];
  }
  
  // 1. Teile den Text in Zeilen
  const lines = text.split('\n');
  
  // 2. Finde die Tabellenüberschrift
  let headerLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("Transporter ID") && 
        lines[i].includes("Delivered") && 
        lines[i].includes("DCR") && 
        lines[i].includes("DNR DPMO")) {
      headerLineIndex = i;
      break;
    }
  }
  
  if (headerLineIndex === -1) {
    console.log("Tabellenüberschriften nicht gefunden");
    return [];
  }
  
  console.log(`Tabellenüberschrift gefunden in Zeile ${headerLineIndex}`);
  
  // 3. Extrahiere die Datenzeilen
  const drivers: DriverKPI[] = [];
  
  // Starte mit der Zeile nach der Überschrift
  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Stoppe, wenn wir eine leere Zeile oder das Ende der Tabelle erreichen
    if (!line || line.startsWith("Total")) break;
    
    // Prüfe, ob die Zeile mit einer Transporter-ID beginnt (A gefolgt von alphanumerischen Zeichen)
    if (/^A[A-Z0-9]/.test(line)) {
      try {
        // Wir haben eine Fahrer-Zeile gefunden
        // Teile die Zeile in Spalten auf
        const columns = line.split(/\s+/);
        
        // Wenn wir nicht mindestens eine ID und einige Metriken haben, überspringe die Zeile
        if (columns.length < 5) continue;
        
        // Extrahiere die ID (erstes Element)
        const driverId = columns[0];
        
        // Initialisiere ein Array für die Metrik-Indizes
        let metricIndices: number[] = [];
        
        // Suche nach numerischen Werten und speichere ihre Indizes
        for (let j = 1; j < columns.length; j++) {
          if (/^[0-9]+(\.[0-9]+)?%?$/.test(columns[j])) {
            metricIndices.push(j);
          }
        }
        
        // Wenn wir nicht genügend numerische Werte finden, versuche eine alternative Methode
        if (metricIndices.length < 4) {
          // Verwende reguläre Ausdrücke, um die Zahlen direkt zu extrahieren
          const numbersMatch = line.match(/\b(\d+(?:\.\d+)?)\b/g);
          if (numbersMatch && numbersMatch.length >= 4) {
            console.log(`Alternative Extraktion für Zeile: ${line}`);
            
            // Erstelle einen Fahrer mit den extrahierten Werten
            const driver: DriverKPI = {
              name: driverId,
              status: "active",
              metrics: [
                {
                  name: "Delivered",
                  value: parseFloat(numbersMatch[0]),
                  target: 0,
                  status: "fair" // Changed from "neutral" to "fair"
                },
                {
                  name: "DCR",
                  value: parseFloat(numbersMatch[1]),
                  target: 98.5,
                  status: determineMetricStatus("DCR", parseFloat(numbersMatch[1]))
                },
                {
                  name: "DNR DPMO",
                  value: parseFloat(numbersMatch[2]),
                  target: 1500,
                  status: determineMetricStatus("DNR DPMO", parseFloat(numbersMatch[2]))
                },
                {
                  name: "POD",
                  value: parseFloat(numbersMatch[3]),
                  target: 98,
                  status: determineMetricStatus("POD", parseFloat(numbersMatch[3]))
                }
              ]
            };
            
            // Füge weitere Metriken hinzu, wenn verfügbar
            if (numbersMatch.length > 4) {
              driver.metrics.push({
                name: "CC",
                value: parseFloat(numbersMatch[4]),
                target: 95,
                status: determineMetricStatus("CC", parseFloat(numbersMatch[4]))
              });
            }
            
            if (numbersMatch.length > 5) {
              driver.metrics.push({
                name: "CE",
                value: parseFloat(numbersMatch[5] || "0"),
                target: 0,
                status: determineMetricStatus("CE", parseFloat(numbersMatch[5] || "0"))
              });
            }
            
            if (numbersMatch.length > 6) {
              driver.metrics.push({
                name: "DEX",
                value: parseFloat(numbersMatch[6]),
                target: 95,
                status: determineMetricStatus("DEX", parseFloat(numbersMatch[6]))
              });
            }
            
            // Füge vollständige Metriken hinzu
            driver.metrics = createAllStandardMetrics(driver.metrics);
            drivers.push(driver);
            continue;
          }
        }
        
        // Wenn wir genügend Indizes haben, erstelle einen Fahrer
        if (metricIndices.length >= 4) {
          console.log(`Extraktion für Fahrer: ${driverId} mit ${metricIndices.length} Metriken`);
          
          // Mappe die Spaltenindizes zu bestimmten Metriken
          const metrics = [
            {
              name: "Delivered",
              value: parseFloat(columns[metricIndices[0]].replace('%', '')),
              target: 0,
              status: "fair" // Changed from "neutral" to "fair"
            },
            {
              name: "DCR",
              value: parseFloat(columns[metricIndices[1]].replace('%', '')),
              target: 98.5,
              status: determineMetricStatus("DCR", parseFloat(columns[metricIndices[1]].replace('%', '')))
            },
            {
              name: "DNR DPMO",
              value: parseFloat(columns[metricIndices[2]].replace('%', '')),
              target: 1500,
              status: determineMetricStatus("DNR DPMO", parseFloat(columns[metricIndices[2]].replace('%', '')))
            },
            {
              name: "POD",
              value: parseFloat(columns[metricIndices[3]].replace('%', '')),
              target: 98,
              status: determineMetricStatus("POD", parseFloat(columns[metricIndices[3]].replace('%', '')))
            }
          ];
          
          // Füge CC hinzu, wenn verfügbar
          if (metricIndices.length > 4) {
            metrics.push({
              name: "CC",
              value: parseFloat(columns[metricIndices[4]].replace('%', '')),
              target: 95,
              status: determineMetricStatus("CC", parseFloat(columns[metricIndices[4]].replace('%', '')))
            });
          }
          
          // Füge CE hinzu, wenn verfügbar
          if (metricIndices.length > 5) {
            metrics.push({
              name: "CE",
              value: parseFloat(columns[metricIndices[5]].replace('%', '') || "0"),
              target: 0,
              status: determineMetricStatus("CE", parseFloat(columns[metricIndices[5]].replace('%', '') || "0"))
            });
          }
          
          // Füge DEX hinzu, wenn verfügbar
          if (metricIndices.length > 6) {
            metrics.push({
              name: "DEX",
              value: parseFloat(columns[metricIndices[6]].replace('%', '')),
              target: 95,
              status: determineMetricStatus("DEX", parseFloat(columns[metricIndices[6]].replace('%', '')))
            });
          }
          
          // Erstelle den Fahrer und füge ihn zur Liste hinzu
          const driver: DriverKPI = {
            name: driverId,
            status: "active",
            metrics: createAllStandardMetrics(metrics) // Stelle sicher, dass alle Standardmetriken vorhanden sind
          };
          
          drivers.push(driver);
        }
      } catch (error) {
        console.error(`Fehler beim Verarbeiten der Zeile ${i}:`, error);
        // Fahre mit der nächsten Zeile fort
      }
    }
  }
  
  console.log(`Extrahiert: ${drivers.length} Fahrer aus DSP WEEKLY SUMMARY Tabelle`);
  return drivers;
}

/**
 * Optimierte Extraktion für Tabellendaten mit festen Spaltenbreiten,
 * spezifisch für das DSP WEEKLY SUMMARY Format
 */
export function extractDriversFromFixedWidthTable(text: string): DriverKPI[] {
  console.log("Extrahiere Fahrer aus DSP WEEKLY SUMMARY mit fester Spaltenbreite");
  
  // Suche nach dem DSP WEEKLY SUMMARY Header
  if (!text.includes("DSP WEEKLY SUMMARY")) {
    console.log("DSP WEEKLY SUMMARY nicht gefunden");
    return [];
  }
  
  // Definiere Regex-Pattern für Zeilen mit Transporter IDs
  // Format: A-Code + Zahlen + Prozente
  const rowPattern = /^(A[A-Z0-9]+)\s+(\d+)\s+([\d.]+)%?\s+([\d.]+)\s+([\d.]+)%?\s+([\d.]+)%?\s+(\d+)\s+([\d.]+)%?/gm;
  
  const drivers: DriverKPI[] = [];
  let match;
  
  // Finde alle übereinstimmenden Zeilen
  while ((match = rowPattern.exec(text)) !== null) {
    try {
      const [
        _, // Gesamter Match
        driverId,
        delivered,
        dcr,
        dnrDpmo,
        pod,
        cc,
        ce,
        dex
      ] = match;
      
      // Erstelle einen Fahrer mit den extrahierten Werten
      const driver: DriverKPI = {
        name: driverId,
        status: "active",
        metrics: [
          {
            name: "Delivered",
            value: parseFloat(delivered),
            target: 0,
            status: "fair" // Changed from "neutral" to "fair"
          },
          {
            name: "DCR",
            value: parseFloat(dcr),
            target: 98.5,
            status: determineMetricStatus("DCR", parseFloat(dcr))
          },
          {
            name: "DNR DPMO",
            value: parseFloat(dnrDpmo),
            target: 1500,
            status: determineMetricStatus("DNR DPMO", parseFloat(dnrDpmo))
          },
          {
            name: "POD",
            value: parseFloat(pod),
            target: 98,
            status: determineMetricStatus("POD", parseFloat(pod))
          },
          {
            name: "CC",
            value: parseFloat(cc),
            target: 95,
            status: determineMetricStatus("CC", parseFloat(cc))
          },
          {
            name: "CE",
            value: parseFloat(ce),
            target: 0,
            status: determineMetricStatus("CE", parseFloat(ce))
          },
          {
            name: "DEX",
            value: parseFloat(dex),
            target: 95,
            status: determineMetricStatus("DEX", parseFloat(dex))
          }
        ]
      };
      
      drivers.push(driver);
    } catch (error) {
      console.error("Fehler beim Verarbeiten eines Tabelleneintrags:", error);
      // Fahre mit dem nächsten Match fort
    }
  }
  
  // Wenn die Regex-Methode keine Fahrer fand, versuche die zeilenbasierte Methode
  if (drivers.length === 0) {
    console.log("Regex-Methode fand keine Fahrer, versuche zeilenbasierte Extraktion");
    return extractDriversFromDSPWeeklySummary(text);
  }
  
  console.log(`Extrahiert: ${drivers.length} Fahrer mit fester Spaltenbreiten-Methode`);
  return drivers;
}

