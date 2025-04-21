
import { determineMetricStatus } from './utils/metricStatus';
import { createAllStandardMetrics } from './utils/metricUtils';

export const extractDriverKPIsFromText = (text: string) => {
  const dspSummaryIndex = text.indexOf("DSP WEEKLY SUMMARY");
  
  if (dspSummaryIndex === -1) {
    console.log("DSP WEEKLY SUMMARY nicht gefunden");
    return [];
  }
  
  const relevantText = text.substring(dspSummaryIndex);
  
  // Updated header pattern to match what's in the image - looking for the header row with all columns
  const headerPattern = /Transporter\s*ID\s*[\s|]*Delivered\s*[\s|]*DCR\s*[\s|]*DNR\s*DPMO\s*[\s|]*LoR\s*DPMO\s*[\s|]*POD\s*[\s|]*CC\s*[\s|]*CE\s*[\s|]*CDF/i;
  const headerMatch = relevantText.match(headerPattern);
  
  if (!headerMatch) {
    console.log("Tabellenüberschrift nicht gefunden");
    // Try a more flexible pattern in case the header format varies
    const flexibleHeaderPattern = /Transporter\s*ID.*Delivered.*DCR.*DNR.*DPMO/i;
    const flexibleMatch = relevantText.match(flexibleHeaderPattern);
    if (!flexibleMatch) {
      return [];
    }
  }
  
  const lines = relevantText.split('\n');
  
  // Find the line that contains the table header
  let tableStartIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("Transporter ID") && 
        (lines[i].includes("Delivered") || lines[i].includes("DCR"))) {
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
    if (line.match(/^A[A-Z0-9]{6,}/)) {
      // Split the line by whitespace or tab characters to get the individual values
      const values = line.split(/\s+/).filter(val => val !== '');
      
      if (values.length >= 8) {  // We need at least 8 columns of data
        const [id, deliveredStr, dcrStr, dnrDpmoStr, lorDpmoStr, podStr, ccStr, ceStr, cdfStr] = values;
        
        // Parse the numeric values
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
        console.log(`Processed driver: ${id}`);
      } else {
        console.log(`Line has insufficient data: ${values.length} values`, line);
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
