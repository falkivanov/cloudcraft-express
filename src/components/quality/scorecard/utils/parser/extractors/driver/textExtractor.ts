
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
      
      console.log(`Analyzing line with ${values.length} values:`, values);
      
      if (values.length >= 8) {  // We need at least 8 columns of data
        const driverId = values[0];
        
        // Parse the numeric values based on the index
        const delivered = parseFloat(values[1]) || 0;
        
        let dcr = values[2] ? parseFloat(values[2].replace('%', '')) || 0 : 0;
        if (dcr > 100) dcr = dcr / 100;
        
        const dnrDpmo = values[3] ? parseFloat(values[3]) || 0 : 0;
        const lorDpmo = values[4] ? parseFloat(values[4]) || 0 : 0;
        
        let pod = values[5] === "-" ? 0 : (values[5] ? parseFloat(values[5].replace('%', '')) || 0 : 0);
        if (pod > 100) pod = pod / 100;
        
        let cc = values[6] === "-" ? 0 : (values[6] ? parseFloat(values[6].replace('%', '')) || 0 : 0);
        if (cc > 100) cc = cc / 100;
        
        const ce = values[7] ? parseFloat(values[7]) || 0 : 0;
        
        let cdf = values.length > 8 ? 
          (values[8] === "-" ? 0 : parseFloat(values[8].replace('%', '')) || 0) : 0;
        if (cdf > 100) cdf = cdf / 100;
        
        console.log(`Processing driver ${driverId} with values:`, {
          delivered, dcr, dnrDpmo, lorDpmo, pod, cc, ce, cdf
        });
        
        const driver = {
          id: driverId,
          name: driverId,
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
              status: values[5] === "-" ? "none" : determineMetricStatus("POD", pod)
            },
            {
              name: "CC",
              value: cc,
              target: 95,
              unit: "%",
              status: values[6] === "-" ? "none" : determineMetricStatus("CC", cc)
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
              status: values.length > 8 && values[8] === "-" ? "none" : determineMetricStatus("CDF", cdf)
            }
          ],
          status: "active"
        };
        
        drivers.push(driver);
        console.log(`Processed driver: ${driverId}`);
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
