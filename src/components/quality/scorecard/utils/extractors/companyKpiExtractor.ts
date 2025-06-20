
import { ScorecardKPI } from "../../types";
import { determineStatus, getDefaultTargetForKPI, KPIStatus } from '../helpers/statusHelper';

/**
 * Extract company KPIs from text content - improved to detect more KPIs including status indicators
 */
export const extractCompanyKPIs = (text: string): ScorecardKPI[] => {
  // Try to identify KPI patterns in the text
  const kpis: ScorecardKPI[] = [];
  
  // Enhanced patterns with more variations to catch more KPIs, including status information
  const kpiPatterns = [
    // Safety KPIs with status
    { name: "Vehicle Audit (VSA) Compliance", pattern: /(?:VSA|Vehicle\s+Audit|Vehicle\s+Safety\s+Audit)[:\s]+(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "%", category: "safety" },
    // Fallback without status
    { name: "Vehicle Audit (VSA) Compliance", pattern: /(?:VSA|Vehicle\s+Audit|Vehicle\s+Safety\s+Audit)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "safety" },
    
    // Repeat this pattern for all KPIs - first try with status, then fallback without
    { name: "DVIC Compliance", pattern: /(?:DVIC|Daily\s+Vehicle\s+Inspection)[:\s]+(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "%", category: "safety" },
    { name: "DVIC Compliance", pattern: /(?:DVIC|Daily\s+Vehicle\s+Inspection)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "safety" },
    
    { name: "Safe Driving Metric (FICO)", pattern: /(?:FICO|Safe\s+Driving)[:\s]+(\d+(?:\.\d+)?)\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "", category: "safety" },
    { name: "Safe Driving Metric (FICO)", pattern: /(?:FICO|Safe\s+Driving)[:\s]+(\d+(?:\.\d+)?)/i, unit: "", category: "safety" },
    
    { name: "Speeding Event Rate (Per 100 Trips)", pattern: /(?:Speeding|Speeding\s+Event)[:\s]+(\d+(?:\.\d+)?)\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "", category: "safety" },
    { name: "Speeding Event Rate (Per 100 Trips)", pattern: /(?:Speeding|Speeding\s+Event)[:\s]+(\d+(?:\.\d+)?)/i, unit: "", category: "safety" },
    
    { name: "Mentor Adoption Rate", pattern: /(?:Mentor\s+Adoption)[:\s]+(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "%", category: "safety" },
    { name: "Mentor Adoption Rate", pattern: /(?:Mentor\s+Adoption)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "safety" },
    
    // Compliance KPIs
    { name: "Breach of Contract (BOC)", pattern: /(?:BOC|Breach\s+of\s+Contract)[:\s]+(\d+(?:\.\d+)?)\s*(?:\||\s+)?\s*(poor|fair|great|fantastic|in compliance|not in compliance)/i, unit: "", category: "compliance" },
    { name: "Breach of Contract (BOC)", pattern: /(?:BOC|Breach\s+of\s+Contract)[:\s]+(\d+(?:\.\d+)?)/i, unit: "", category: "compliance" },
    
    { name: "Working Hours Compliance (WHC)", pattern: /(?:WHC|Working\s+Hours)[:\s]+(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic|in compliance|not in compliance)/i, unit: "%", category: "compliance" },
    { name: "Working Hours Compliance (WHC)", pattern: /(?:WHC|Working\s+Hours)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "compliance" },
    
    { name: "Comprehensive Audit Score (CAS)", pattern: /(?:CAS|Comprehensive\s+Audit)[:\s]+(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic|in compliance|not in compliance)/i, unit: "%", category: "compliance" },
    { name: "Comprehensive Audit Score (CAS)", pattern: /(?:CAS|Comprehensive\s+Audit)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "compliance" },
    
    // Quality KPIs
    { name: "Delivery Completion Rate (DCR)", pattern: /(?:DCR|Delivery\s+Completion\s+Rate)[:\s]+(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "%", category: "quality" },
    { name: "Delivery Completion Rate (DCR)", pattern: /(?:DCR|Delivery\s+Completion\s+Rate)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "quality" },
    
    { name: "Delivered Not Received (DNR DPMO)", pattern: /(?:DNR|Delivered\s+Not\s+Received)(?:\s+DPMO)?[:\s]+(\d+(?:\.\d+)?)\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "DPMO", category: "quality" },
    { name: "Delivered Not Received (DNR DPMO)", pattern: /(?:DNR|Delivered\s+Not\s+Received)(?:\s+DPMO)?[:\s]+(\d+(?:\.\d+)?)/i, unit: "DPMO", category: "quality" },
    
    { name: "Lost on Road (LoR) DPMO", pattern: /(?:LoR|Lost\s+on\s+Road)(?:\s+DPMO)?[:\s]+(\d+(?:\.\d+)?)\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "DPMO", category: "quality" },
    { name: "Lost on Road (LoR) DPMO", pattern: /(?:LoR|Lost\s+on\s+Road)(?:\s+DPMO)?[:\s]+(\d+(?:\.\d+)?)/i, unit: "DPMO", category: "quality" },
    
    // Standard Work Compliance
    { name: "Photo-On-Delivery", pattern: /(?:Photo[- ]On[- ]Delivery|POD)[:\s]+(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "%", category: "standardWork" },
    { name: "Photo-On-Delivery", pattern: /(?:Photo[- ]On[- ]Delivery|POD)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "standardWork" },
    
    { name: "Contact Compliance", pattern: /Contact\s+Compliance[:\s]+(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "%", category: "standardWork" },
    { name: "Contact Compliance", pattern: /Contact\s+Compliance[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "standardWork" },
    
    { name: "Door to Door delivery", pattern: /(?:Door\s+to\s+Door|DTD)[:\s]+(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "%", category: "standardWork" },
    { name: "Door to Door delivery", pattern: /(?:Door\s+to\s+Door|DTD)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "standardWork" },
    
    { name: "Right to Driver (RTD)", pattern: /(?:Right\s+to\s+Driver|RTD)[:\s]+(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "%", category: "standardWork" },
    { name: "Right to Driver (RTD)", pattern: /(?:Right\s+to\s+Driver|RTD)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "standardWork" },
    
    // Customer Experience KPIs
    { name: "Customer escalation DPMO", pattern: /(?:Customer\s+escalation|CSAT|Customer\s+Satisfaction)(?:\s+DPMO)?[:\s]+(\d+(?:\.\d+)?)\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "DPMO", category: "customer" },
    { name: "Customer escalation DPMO", pattern: /(?:Customer\s+escalation|CSAT|Customer\s+Satisfaction)(?:\s+DPMO)?[:\s]+(\d+(?:\.\d+)?)/i, unit: "DPMO", category: "customer" },
    
    { name: "Customer Delivery Feedback", pattern: /(?:Customer\s+Delivery\s+Feedback|CDF)[:\s]+(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "%", category: "customer" },
    { name: "Customer Delivery Feedback", pattern: /(?:Customer\s+Delivery\s+Feedback|CDF)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "customer" },
    
    { name: "Concessions DPMO", pattern: /(?:Concessions|Koncessions)(?:\s+DPMO)?[:\s]+(\d+(?:\.\d+)?)\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "DPMO", category: "customer" },
    { name: "Concessions DPMO", pattern: /(?:Concessions|Koncessions)(?:\s+DPMO)?[:\s]+(\d+(?:\.\d+)?)/i, unit: "DPMO", category: "customer" },
    
    // Capacity KPIs
    { name: "Capacity Reliability", pattern: /Capacity\s+Reliability[:\s]+(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "%", category: "capacity" },
    { name: "Capacity Reliability", pattern: /Capacity\s+Reliability[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "capacity" },
    
    { name: "Next Day Capacity Reliability", pattern: /Next\s+Day\s+Capacity[:\s]+(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "%", category: "capacity" },
    { name: "Next Day Capacity Reliability", pattern: /Next\s+Day\s+Capacity[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "capacity" }
  ];
  
  console.log("Extracting company KPIs from scorecard text, page 2");
  
  // Extract overall score and status
  const overallPatterns = [
    /overall(?:\s+score)?:?\s*(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i,
    /score:?\s*(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i
  ];
  
  let overallScore = 0;
  let overallStatus: KPIStatus = "fair";
  
  for (const pattern of overallPatterns) {
    const match = text.match(pattern);
    if (match) {
      overallScore = parseFloat(match[1]);
      const statusText = match[2].toLowerCase();
      
      if (statusText === "poor") overallStatus = "poor";
      else if (statusText === "fair") overallStatus = "fair";
      else if (statusText === "great") overallStatus = "great";
      else if (statusText === "fantastic") overallStatus = "fantastic";
      
      console.log(`Found overall score ${overallScore}% with status "${overallStatus}"`);
      break;
    }
  }
  
  // Check each pattern against the text
  for (const { name, pattern, unit, category } of kpiPatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      
      // Check if this pattern includes status information
      let status: KPIStatus;
      if (match.length >= 3 && match[2]) {
        const statusText = match[2].toLowerCase();
        if (statusText === "poor") status = "poor";
        else if (statusText === "fair") status = "fair";
        else if (statusText === "great") status = "great";
        else if (statusText === "fantastic") status = "fantastic";
        else if (statusText === "in compliance") status = "in compliance";
        else if (statusText === "not in compliance") status = "not in compliance";
        else status = determineStatus(name, value);
        
        console.log(`Found KPI: ${name} = ${value} with status: ${status}`);
      } else {
        status = determineStatus(name, value);
        console.log(`Found KPI: ${name} = ${value}, determined status: ${status}`);
      }
      
      // Skip if we already have a KPI with this name
      if (!kpis.some(k => k.name === name)) {
        kpis.push({
          name,
          value,
          target: getDefaultTargetForKPI(name),
          unit,
          trend: "neutral" as "up" | "down" | "neutral",
          status,
          category: category as "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity"
        });
      }
    }
  }
  
  // Generic KPI extractor for page 2 to find additional KPIs
  // This approach looks for patterns with status indicators
  
  // Look for patterns with percentages and status
  const percentWithStatusPatterns = text.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-)(?:\s*)(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/gi);
  if (percentWithStatusPatterns) {
    percentWithStatusPatterns.forEach(match => {
      const parts = match.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-)(?:\s*)(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i);
      if (parts && parts.length >= 4) {
        const kpiName = parts[1].trim();
        const value = parseFloat(parts[2]);
        const statusText = parts[3].toLowerCase();
        
        let status: KPIStatus;
        if (statusText === "poor") status = "poor";
        else if (statusText === "fair") status = "fair";
        else if (statusText === "great") status = "great";
        else if (statusText === "fantastic") status = "fantastic";
        else status = determineStatus(kpiName, value);
        
        // Skip if already exists
        if (!kpis.some(k => k.name.toLowerCase() === kpiName.toLowerCase())) {
          console.log(`Found generic percentage KPI with status: ${kpiName} = ${value}%, status: ${status}`);
          
          // Try to determine category based on the KPI name
          let category: "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity" | undefined;
          
          if (kpiName.toLowerCase().includes('safe') || kpiName.toLowerCase().includes('fico') || 
              kpiName.toLowerCase().includes('speeding') || kpiName.toLowerCase().includes('mentor')) {
            category = "safety";
          } else if (kpiName.toLowerCase().includes('compliance') || kpiName.toLowerCase().includes('audit') || 
                     kpiName.toLowerCase().includes('boc') || kpiName.toLowerCase().includes('whc')) {
            category = "compliance";
          } else if (kpiName.toLowerCase().includes('customer') || kpiName.toLowerCase().includes('escalation') || 
                     kpiName.toLowerCase().includes('feedback')) {
            category = "customer";
          } else if (kpiName.toLowerCase().includes('photo') || kpiName.toLowerCase().includes('contact') || 
                     kpiName.toLowerCase().includes('pod')) {
            category = "standardWork";
          } else if (kpiName.toLowerCase().includes('dcr') || kpiName.toLowerCase().includes('dnr') || 
                     kpiName.toLowerCase().includes('lor')) {
            category = "quality";
          } else if (kpiName.toLowerCase().includes('capacity') || kpiName.toLowerCase().includes('reliability')) {
            category = "capacity";
          }
          
          kpis.push({
            name: kpiName,
            value,
            target: 95, // Default target for percentage metrics
            unit: "%",
            trend: "neutral" as "up" | "down" | "neutral",
            status,
            category
          });
        }
      }
    });
  }
  
  // Look for percentage patterns without status (fallback)
  const percentagePatterns = text.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-)(?:\s*)(\d+(?:\.\d+)?)\s*%/g);
  if (percentagePatterns) {
    percentagePatterns.forEach(match => {
      const parts = match.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-)(?:\s*)(\d+(?:\.\d+)?)\s*%/);
      if (parts && parts.length >= 3) {
        const kpiName = parts[1].trim();
        const value = parseFloat(parts[2]);
        
        // Skip if already exists
        if (!kpis.some(k => k.name.toLowerCase() === kpiName.toLowerCase())) {
          console.log(`Found generic percentage KPI: ${kpiName} = ${value}%`);
          
          // Try to determine category based on the KPI name
          let category: "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity" | undefined;
          
          if (kpiName.toLowerCase().includes('safe') || kpiName.toLowerCase().includes('fico') || 
              kpiName.toLowerCase().includes('speeding') || kpiName.toLowerCase().includes('mentor')) {
            category = "safety";
          } else if (kpiName.toLowerCase().includes('compliance') || kpiName.toLowerCase().includes('audit') || 
                     kpiName.toLowerCase().includes('boc') || kpiName.toLowerCase().includes('whc')) {
            category = "compliance";
          } else if (kpiName.toLowerCase().includes('customer') || kpiName.toLowerCase().includes('escalation') || 
                     kpiName.toLowerCase().includes('feedback')) {
            category = "customer";
          } else if (kpiName.toLowerCase().includes('photo') || kpiName.toLowerCase().includes('contact') || 
                     kpiName.toLowerCase().includes('pod')) {
            category = "standardWork";
          } else if (kpiName.toLowerCase().includes('dcr') || kpiName.toLowerCase().includes('dnr') || 
                     kpiName.toLowerCase().includes('lor')) {
            category = "quality";
          } else if (kpiName.toLowerCase().includes('capacity') || kpiName.toLowerCase().includes('reliability')) {
            category = "capacity";
          }
          
          kpis.push({
            name: kpiName,
            value,
            target: 95, // Default target for percentage metrics
            unit: "%",
            trend: "neutral" as "up" | "down" | "neutral",
            status: determineStatus(kpiName, value),
            category
          });
        }
      }
    });
  }
  
  // Look for DPMO patterns with status
  const dpmoWithStatusPatterns = text.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-)(?:\s*)(\d+(?:\.\d+)?)\s*(?:DPMO)?\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/gi);
  if (dpmoWithStatusPatterns) {
    dpmoWithStatusPatterns.forEach(match => {
      // Only process if it contains 'DPMO' or is a known DPMO metric
      if (match.includes('DPMO') || match.includes('DNR') || match.includes('LoR') || match.includes('Concession')) {
        const parts = match.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-)(?:\s*)(\d+(?:\.\d+)?)\s*(?:DPMO)?\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i);
        if (parts && parts.length >= 4) {
          const kpiName = parts[1].trim();
          const value = parseFloat(parts[2]);
          const statusText = parts[3].toLowerCase();
          
          let status: KPIStatus;
          if (statusText === "poor") status = "poor";
          else if (statusText === "fair") status = "fair";
          else if (statusText === "great") status = "great";
          else if (statusText === "fantastic") status = "fantastic";
          else status = determineStatus(kpiName, value);
          
          // Skip if already exists
          if (!kpis.some(k => k.name.toLowerCase() === kpiName.toLowerCase())) {
            console.log(`Found generic DPMO KPI with status: ${kpiName} = ${value}, status: ${status}`);
            
            // Try to determine category based on the KPI name
            let category: "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity" | undefined;
            
            if (kpiName.toLowerCase().includes('customer') || kpiName.toLowerCase().includes('escalation')) {
              category = "customer";
            } else if (kpiName.toLowerCase().includes('dnr') || kpiName.toLowerCase().includes('lor')) {
              category = "quality";
            }
            
            kpis.push({
              name: kpiName,
              value,
              target: 3000, // Default target for DPMO metrics
              unit: "DPMO",
              trend: "neutral" as "up" | "down" | "neutral",
              status,
              category
            });
          }
        }
      }
    });
  }
  
  // Look for DPMO patterns without status (fallback)
  const dpmoPatterns = text.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-)(?:\s*)(\d+(?:\.\d+)?)\s*(?:DPMO)?/g);
  if (dpmoPatterns) {
    dpmoPatterns.forEach(match => {
      // Only process if it contains 'DPMO' or is a known DPMO metric
      if (match.includes('DPMO') || match.includes('DNR') || match.includes('LoR') || match.includes('Concession')) {
        const parts = match.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-)(?:\s*)(\d+(?:\.\d+)?)\s*(?:DPMO)?/i);
        if (parts && parts.length >= 3) {
          const kpiName = parts[1].trim();
          const value = parseFloat(parts[2]);
          
          // Skip if already exists
          if (!kpis.some(k => k.name.toLowerCase() === kpiName.toLowerCase())) {
            console.log(`Found generic DPMO KPI: ${kpiName} = ${value}`);
            
            // Try to determine category based on the KPI name
            let category: "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity" | undefined;
            
            if (kpiName.toLowerCase().includes('customer') || kpiName.toLowerCase().includes('escalation')) {
              category = "customer";
            } else if (kpiName.toLowerCase().includes('dnr') || kpiName.toLowerCase().includes('lor')) {
              category = "quality";
            }
            
            kpis.push({
              name: kpiName,
              value,
              target: 3000, // Default target for DPMO metrics
              unit: "DPMO",
              trend: "neutral" as "up" | "down" | "neutral",
              status: determineStatus(kpiName, value),
              category
            });
          }
        }
      }
    });
  }
  
  // Look for numeric values with status (like FICO)
  const numericWithStatusPatterns = text.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-)(?:\s*)(\d+(?:\.\d+)?)\s*(?![%DPMO])\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/gi);
  if (numericWithStatusPatterns) {
    numericWithStatusPatterns.forEach(match => {
      const parts = match.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-)(?:\s*)(\d+(?:\.\d+)?)\s*(?![%DPMO])\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i);
      if (parts && parts.length >= 4) {
        const kpiName = parts[1].trim();
        const value = parseFloat(parts[2]);
        const statusText = parts[3].toLowerCase();
        
        let status: KPIStatus;
        if (statusText === "poor") status = "poor";
        else if (statusText === "fair") status = "fair";
        else if (statusText === "great") status = "great";
        else if (statusText === "fantastic") status = "fantastic";
        else status = determineStatus(kpiName, value);
        
        // Skip if already exists
        if (!kpis.some(k => k.name.toLowerCase() === kpiName.toLowerCase())) {
          // Only add if it's likely a KPI (not just any number)
          if (kpiName.length > 3 && !kpiName.includes('Week') && !kpiName.includes('Date')) {
            console.log(`Found generic numeric KPI with status: ${kpiName} = ${value}, status: ${status}`);
            
            // Try to determine category based on the KPI name
            let category: "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity" | undefined;
            
            if (kpiName.toLowerCase().includes('fico') || kpiName.toLowerCase().includes('safe driving')) {
              category = "safety";
            } else if (kpiName.toLowerCase().includes('breach') || kpiName.toLowerCase().includes('boc')) {
              category = "compliance";
            }
            
            kpis.push({
              name: kpiName,
              value,
              target: kpiName.includes('FICO') ? 800 : 100, // Default targets
              unit: "",
              trend: "neutral" as "up" | "down" | "neutral",
              status,
              category
            });
          }
        }
      }
    });
  }
  
  // Look for numeric values without status (fallback)
  const numericPatterns = text.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-)(?:\s*)(\d+(?:\.\d+)?)\s*(?![%DPMO])/g);
  if (numericPatterns) {
    numericPatterns.forEach(match => {
      const parts = match.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-)(?:\s*)(\d+(?:\.\d+)?)\s*(?![%DPMO])/i);
      if (parts && parts.length >= 3) {
        const kpiName = parts[1].trim();
        const value = parseFloat(parts[2]);
        
        // Skip if already exists
        if (!kpis.some(k => k.name.toLowerCase() === kpiName.toLowerCase())) {
          // Only add if it's likely a KPI (not just any number)
          if (kpiName.length > 3 && !kpiName.includes('Week') && !kpiName.includes('Date')) {
            console.log(`Found generic numeric KPI: ${kpiName} = ${value}`);
            
            // Try to determine category based on the KPI name
            let category: "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity" | undefined;
            
            if (kpiName.toLowerCase().includes('fico') || kpiName.toLowerCase().includes('safe driving')) {
              category = "safety";
            } else if (kpiName.toLowerCase().includes('breach') || kpiName.toLowerCase().includes('boc')) {
              category = "compliance";
            }
            
            kpis.push({
              name: kpiName,
              value,
              target: kpiName.includes('FICO') ? 800 : 100, // Default targets
              unit: "",
              trend: "neutral" as "up" | "down" | "neutral",
              status: determineStatus(kpiName, value),
              category
            });
          }
        }
      }
    });
  }
  
  // Post-processing: deduplicate and handle common variations
  const processedKpis: ScorecardKPI[] = [];
  const processedNames = new Set<string>();
  
  // First pass: normalize and deduplicate
  kpis.forEach(kpi => {
    // Normalize name for comparison (remove extra whitespace, lowercase)
    const normalizedName = kpi.name.replace(/\s+/g, ' ').toLowerCase();
    
    // Skip if we've already added this KPI (by normalized name)
    if (!processedNames.has(normalizedName)) {
      processedNames.add(normalizedName);
      processedKpis.push(kpi);
    }
  });
  
  // Categorize any remaining uncategorized KPIs
  processedKpis.forEach(kpi => {
    if (!kpi.category) {
      // Try to assign a category based on the KPI name
      if (kpi.name.toLowerCase().includes('safe') || kpi.name.toLowerCase().includes('speeding') || 
          kpi.name.toLowerCase().includes('mentor') || kpi.name.toLowerCase().includes('fico')) {
        kpi.category = "safety";
      } else if (kpi.name.toLowerCase().includes('compliance') || kpi.name.toLowerCase().includes('audit') || 
                 kpi.name.toLowerCase().includes('breach') || kpi.name.toLowerCase().includes('contract')) {
        kpi.category = "compliance";
      } else if (kpi.name.toLowerCase().includes('customer') || kpi.name.toLowerCase().includes('escalation') || 
                 kpi.name.toLowerCase().includes('feedback')) {
        kpi.category = "customer";
      } else if (kpi.name.toLowerCase().includes('photo') || kpi.name.toLowerCase().includes('contact') || 
                 kpi.name.toLowerCase().includes('pod')) {
        kpi.category = "standardWork";
      } else if (kpi.name.toLowerCase().includes('dcr') || kpi.name.toLowerCase().includes('dnr') || 
                 kpi.name.toLowerCase().includes('lor') || kpi.name.toLowerCase().includes('delivery completion')) {
        kpi.category = "quality";
      } else if (kpi.name.toLowerCase().includes('capacity') || kpi.name.toLowerCase().includes('reliability')) {
        kpi.category = "capacity";
      }
    }
  });
  
  console.log(`Final KPI count: ${processedKpis.length}`);
  return processedKpis;
};
