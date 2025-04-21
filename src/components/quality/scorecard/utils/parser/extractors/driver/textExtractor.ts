
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
  
  // Check if it's KW14+ format with LoR DPMO column
  const isKW14Format = relevantText.includes("LoR DPMO");
  
  // Identifiziere die Tabellenüberschrift - both formats
  const headerPatternKW14 = /Transport\s*ID\s*[,|]\s*Delivered\s*[,|]\s*DCR\s*[,|]\s*DNR\s*DPMO\s*[,|]\s*LoR\s*DPMO\s*[,|]\s*POD\s*[,|]\s*CC\s*[,|]\s*CE\s*[,|]\s*DEX/i;
  const headerPatternPreKW14 = /Transport\s*ID\s*[,|]\s*Delivered\s*[,|]\s*DCR\s*[,|]\s*DNR\s*DPMO\s*[,|]\s*POD\s*[,|]\s*CC\s*[,|]\s*CE\s*[,|]\s*DEX/i;
  
  const headerMatch = isKW14Format ? 
    relevantText.match(headerPatternKW14) : 
    relevantText.match(headerPatternPreKW14);
  
  if (!headerMatch) {
    console.log("Tabellenüberschrift nicht gefunden");
    return [];
  }
  
  // Teile den Text in Zeilen
  const lines = relevantText.split('\n');
  
  // Finde den Tabellenanfang
  let tableStartIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if ((isKW14Format && headerPatternKW14.test(lines[i])) || 
        (!isKW14Format && headerPatternPreKW14.test(lines[i]))) {
      tableStartIndex = i;
      break;
    }
  }
  
  if (tableStartIndex === -1) {
    console.log("Tabellenanfang nicht gefunden");
    return [];
  }
  
  console.log(`Extrahiere Fahrer aus ${isKW14Format ? "KW14+" : "pre-KW14"} Format`);
  
  // Extrahiere die Fahrerdaten ab der Zeile nach der Überschrift
  const drivers = [];
  for (let i = tableStartIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Überprüfe, ob die Zeile eine Fahrer-ID enthält (beginnt mit "A")
    if (line.match(/^A\w+/)) {
      // Extrahiere die Werte aus der Zeile
      const values = line.split(/[,|\t]+/).map(item => item.trim());
      
      if (isKW14Format && values.length >= 9) {
        // KW14+ format with LoR DPMO
        const [id, deliveredStr, dcrStr, dnrDpmoStr, lorDpmoStr, podStr, ccStr, ceStr, dexStr] = values;
        
        // Parse and normalize values based on metric type
        const delivered = parseFloat(deliveredStr) || 0;
        
        // Handle percentage values correctly
        let dcr = parseFloat(dcrStr.replace('%', '')) || 0;
        if (dcr > 100) dcr = dcr / 100;
        
        const dnrDpmo = parseFloat(dnrDpmoStr) || 0;
        const lorDpmo = parseFloat(lorDpmoStr) || 0;
        
        let pod = podStr === "-" ? 0 : parseFloat(podStr.replace('%', '')) || 0;
        if (pod > 100) pod = pod / 100;
        
        let cc = ccStr === "-" ? 0 : parseFloat(ccStr.replace('%', '')) || 0;
        if (cc > 100) cc = cc / 100;
        
        const ce = parseFloat(ceStr) || 0;
        
        let dex = dexStr === "-" ? 0 : parseFloat(dexStr.replace('%', '')) || 0;
        if (dex > 100) dex = dex / 100;
        
        // Erstelle ein Fahrerobjekt mit den extrahierten Werten
        const driver = {
          id,
          name: id, // Verwende ID als Name, wenn kein Name verfügbar ist
          metrics: [
            {
              name: "Delivered",
              value: delivered,
              target: 0,
              unit: "",
              status: "none"
            },
            {
              name: "DCR",
              value: dcr,
              target: 98.5,
              unit: "%",
              status: determineMetricStatus("DCR", dcr)
            },
            {
              name: "DNR DPMO",
              value: dnrDpmo,
              target: 1500,
              unit: "DPMO",
              status: determineMetricStatus("DNR DPMO", dnrDpmo)
            },
            {
              name: "LoR DPMO",
              value: lorDpmo,
              target: 1000,
              unit: "DPMO",
              status: determineMetricStatus("LoR DPMO", lorDpmo)
            },
            {
              name: "POD",
              value: pod,
              target: 98,
              unit: "%",
              status: podStr === "-" ? "none" : determineMetricStatus("POD", pod)
            },
            {
              name: "CC",
              value: cc,
              target: 95,
              unit: "%",
              status: ccStr === "-" ? "none" : determineMetricStatus("CC", cc)
            },
            {
              name: "CE",
              value: ce,
              target: 0,
              unit: "",
              status: determineMetricStatus("CE", ce)
            },
            {
              name: "DEX",
              value: dex,
              target: 95,
              unit: "%",
              status: dexStr === "-" ? "none" : determineMetricStatus("DEX", dex)
            }
          ],
          status: "active"
        };
        
        drivers.push(driver);
      } 
      else if (!isKW14Format && values.length >= 8) {
        // Pre-KW14 format (original)
        const [id, deliveredStr, dcrStr, dnrDpmoStr, podStr, ccStr, ceStr, dexStr] = values;
        
        // Parse and normalize values based on metric type
        const delivered = parseFloat(deliveredStr) || 0;
        
        // Handle percentage values correctly
        let dcr = parseFloat(dcrStr.replace('%', '')) || 0;
        if (dcr > 100) dcr = dcr / 100;
        
        const dnrDpmo = parseFloat(dnrDpmoStr) || 0;
        
        let pod = podStr === "-" ? 0 : parseFloat(podStr.replace('%', '')) || 0;
        if (pod > 100) pod = pod / 100;
        
        let cc = ccStr === "-" ? 0 : parseFloat(ccStr.replace('%', '')) || 0;
        if (cc > 100) cc = cc / 100;
        
        const ce = parseFloat(ceStr) || 0;
        
        let dex = dexStr === "-" ? 0 : parseFloat(dexStr.replace('%', '')) || 0;
        if (dex > 100) dex = dex / 100;
        
        // Erstelle ein Fahrerobjekt mit den extrahierten Werten
        const driver = {
          id,
          name: id, // Verwende ID als Name, wenn kein Name verfügbar ist
          metrics: [
            {
              name: "Delivered",
              value: delivered,
              target: 0,
              unit: "",
              status: "none"
            },
            {
              name: "DCR",
              value: dcr,
              target: 98.5,
              unit: "%",
              status: determineMetricStatus("DCR", dcr)
            },
            {
              name: "DNR DPMO",
              value: dnrDpmo,
              target: 1500,
              unit: "DPMO",
              status: determineMetricStatus("DNR DPMO", dnrDpmo)
            },
            {
              name: "POD",
              value: pod,
              target: 98,
              unit: "%",
              status: podStr === "-" ? "none" : determineMetricStatus("POD", pod)
            },
            {
              name: "CC",
              value: cc,
              target: 95,
              unit: "%",
              status: ccStr === "-" ? "none" : determineMetricStatus("CC", cc)
            },
            {
              name: "CE",
              value: ce,
              target: 0,
              unit: "",
              status: determineMetricStatus("CE", ce)
            },
            {
              name: "DEX",
              value: dex,
              target: 95,
              unit: "%",
              status: dexStr === "-" ? "none" : determineMetricStatus("DEX", dex)
            }
          ],
          status: "active"
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
