
import { determineMetricStatus } from './utils/metricStatus';
import { createAllStandardMetrics } from './utils/metricUtils';

export const extractDriverKPIsFromText = (text: string) => {
  const dspSummaryIndex = text.indexOf("DSP WEEKLY SUMMARY");
  
  if (dspSummaryIndex === -1) {
    console.log("DSP WEEKLY SUMMARY nicht gefunden");
    return [];
  }
  
  const relevantText = text.substring(dspSummaryIndex);
  
  // Updated header pattern to include both old (DEX) and new (LoR DPMO, CDF) format
  const headerPattern = /Transport\s*ID\s*[,|]\s*Delivered\s*[,|]\s*DCR\s*[,|]\s*DNR\s*DPMO\s*[,|]\s*(LoR\s*DPMO\s*[,|]\s*)?POD\s*[,|]\s*CC\s*[,|]\s*CE\s*[,|]\s*(DEX|CDF)/i;
  const headerMatch = relevantText.match(headerPattern);
  
  if (!headerMatch) {
    console.log("Tabellenüberschrift nicht gefunden");
    return [];
  }
  
  const lines = relevantText.split('\n');
  
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
  
  const drivers = [];
  for (let i = tableStartIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.match(/^A\w+/)) {
      const values = line.split(/[,|\t]+/).map(item => item.trim());
      
      if (values.length >= 8) {
        const [id, deliveredStr, dcrStr, dnrDpmoStr, lorDpmoStr, podStr, ccStr, ceStr, cdfStr] = values;
        
        const delivered = parseFloat(deliveredStr) || 0;
        
        let dcr = parseFloat(dcrStr.replace('%', '')) || 0;
        if (dcr > 100) dcr = dcr / 100;
        
        const dnrDpmo = parseFloat(dnrDpmoStr) || 0;
        const lorDpmo = parseFloat(lorDpmoStr) || 0;
        
        let pod = podStr === "-" ? 0 : parseFloat(podStr.replace('%', '')) || 0;
        if (pod > 100) pod = pod / 100;
        
        let cc = ccStr === "-" ? 0 : parseFloat(ccStr.replace('%', '')) || 0;
        if (cc > 100) cc = cc / 100;
        
        const ce = parseFloat(ceStr) || 0;
        
        let cdf = cdfStr === "-" ? 0 : parseFloat(cdfStr.replace('%', '')) || 0;
        if (cdf > 100) cdf = cdf / 100;
        
        const driver = {
          id,
          name: id,
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
              target: 1500,
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
              name: "CDF",
              value: cdf,
              target: 95,
              unit: "%",
              status: cdfStr === "-" ? "none" : determineMetricStatus("CDF", cdf)
            }
          ],
          status: "active"
        };
        
        drivers.push(driver);
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
