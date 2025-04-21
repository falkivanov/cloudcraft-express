
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
        const [id, deliveredStr, dcrStr, dnrDpmoStr, lorDpmoOrPodStr, podOrCcStr, ccOrCeStr, ceOrCdfStr, cdfOrExtraStr] = values;
        
        // Determine if we have the LoR DPMO column (newer format) or not
        const hasLorDpmo = headerMatch[1] !== undefined;
        
        const delivered = parseFloat(deliveredStr) || 0;
        
        let dcr = parseFloat(dcrStr.replace('%', '')) || 0;
        if (dcr > 100) dcr = dcr / 100;
        
        const dnrDpmo = parseFloat(dnrDpmoStr) || 0;
        
        // Handle dynamic positioning based on whether LoR DPMO exists
        let lorDpmo = 0;
        let pod = 0;
        let cc = 0;
        let ce = 0;
        let cdf = 0;
        
        if (hasLorDpmo) {
          // New format with LoR DPMO
          lorDpmo = parseFloat(lorDpmoOrPodStr) || 0;
          
          pod = podOrCcStr === "-" ? 0 : parseFloat(podOrCcStr.replace('%', '')) || 0;
          if (pod > 100) pod = pod / 100;
          
          cc = ccOrCeStr === "-" ? 0 : parseFloat(ccOrCeStr.replace('%', '')) || 0;
          if (cc > 100) cc = cc / 100;
          
          ce = parseFloat(ceOrCdfStr) || 0;
          
          cdf = cdfOrExtraStr === "-" ? 0 : parseFloat(cdfOrExtraStr.replace('%', '')) || 0;
          if (cdf > 100) cdf = cdf / 100;
        } else {
          // Old format without LoR DPMO
          pod = lorDpmoOrPodStr === "-" ? 0 : parseFloat(lorDpmoOrPodStr.replace('%', '')) || 0;
          if (pod > 100) pod = pod / 100;
          
          cc = podOrCcStr === "-" ? 0 : parseFloat(podOrCcStr.replace('%', '')) || 0;
          if (cc > 100) cc = cc / 100;
          
          ce = parseFloat(ccOrCeStr) || 0;
          
          cdf = ceOrCdfStr === "-" ? 0 : parseFloat(ceOrCdfStr.replace('%', '')) || 0;
          if (cdf > 100) cdf = cdf / 100;
        }
        
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
              status: podOrCcStr === "-" ? "none" : determineMetricStatus("POD", pod)
            },
            {
              name: "CC",
              value: cc,
              target: 95,
              unit: "%",
              status: ccOrCeStr === "-" ? "none" : determineMetricStatus("CC", cc)
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
              status: cdfOrExtraStr === "-" ? "none" : determineMetricStatus("CDF", cdf)
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
