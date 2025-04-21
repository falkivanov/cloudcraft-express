
import { ScorecardKPI } from "../../types";
import { determineStatus, getDefaultTargetForKPI, KPIStatus } from '../helpers/statusHelper';

/**
 * Extract company KPIs from text content - improved to handle format changes in KW14+
 */
export const extractCompanyKPIs = (text: string): ScorecardKPI[] => {
  // Try to identify KPI patterns in the text
  const kpis: ScorecardKPI[] = [];
  const extractedKpiNames = new Set<string>();
  
  console.log("Extracting company KPIs from scorecard text");
  
  // Enhanced patterns with more variations to catch more KPIs, including status information
  const kpiPatterns = [
    // Safety KPIs with status
    { name: "Vehicle Audit (VSA) Compliance", pattern: /(?:VSA|Vehicle\s+Audit|Vehicle\s+Safety\s+Audit)[:\s]+(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "%", category: "safety" },
    // Fallback without status
    { name: "Vehicle Audit (VSA) Compliance", pattern: /(?:VSA|Vehicle\s+Audit|Vehicle\s+Safety\s+Audit)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "safety" },
    
    // DVIC was removed in KW14+ but we keep the pattern for backward compatibility
    { name: "DVIC Compliance", pattern: /(?:DVIC|Daily\s+Vehicle\s+Inspection)[:\s]+(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "%", category: "safety" },
    { name: "DVIC Compliance", pattern: /(?:DVIC|Daily\s+Vehicle\s+Inspection)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "safety" },
    
    { name: "Safe Driving Metric (FICO)", pattern: /(?:FICO|Safe\s+Driving)[:\s]+(\d+(?:\.\d+)?)\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "", category: "safety" },
    { name: "Safe Driving Metric (FICO)", pattern: /(?:FICO|Safe\s+Driving)[:\s]+(\d+(?:\.\d+)?)/i, unit: "", category: "safety" },
    
    { name: "Speeding Event Rate (Per 100 Trips)", pattern: /(?:Speeding|Speeding\s+Event)[:\s]+(\d+(?:\.\d+)?)\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "", category: "safety" },
    { name: "Speeding Event Rate (Per 100 Trips)", pattern: /(?:Speeding|Speeding\s+Event)[:\s]+(\d+(?:\.\d+)?)/i, unit: "", category: "safety" },
    
    { name: "Mentor Adoption Rate", pattern: /(?:Mentor\s+Adoption)[:\s]+(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "%", category: "safety" },
    { name: "Mentor Adoption Rate", pattern: /(?:Mentor\s+Adoption)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "safety" },

    // Looser pattern for Driver Administration (new in KW14+)
    { name: "Driver Administration", pattern: /(?:Driver\s+Admin|Driver\s+Administration)[:\s]+(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "%", category: "safety" },
    { name: "Driver Administration", pattern: /(?:Driver\s+Admin|Driver\s+Administration)[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "safety" },
    
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
    
    { name: "Concessions DPMO", pattern: /(?:Concessions|Konzessions)(?:\s+DPMO)?[:\s]+(\d+(?:\.\d+)?)\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "DPMO", category: "customer" },
    { name: "Concessions DPMO", pattern: /(?:Concessions|Konzessions)(?:\s+DPMO)?[:\s]+(\d+(?:\.\d+)?)/i, unit: "DPMO", category: "customer" },
    
    // Capacity KPIs
    { name: "Capacity Reliability", pattern: /Capacity\s+Reliability[:\s]+(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "%", category: "capacity" },
    { name: "Capacity Reliability", pattern: /Capacity\s+Reliability[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "capacity" },
    
    { name: "Next Day Capacity Reliability", pattern: /Next\s+Day\s+Capacity[:\s]+(\d+(?:\.\d+)?)\s*%\s*(?:\||\s+)?\s*(poor|fair|great|fantastic)/i, unit: "%", category: "capacity" },
    { name: "Next Day Capacity Reliability", pattern: /Next\s+Day\s+Capacity[:\s]+(\d+(?:\.\d+)?)\s*%/i, unit: "%", category: "capacity" }
  ];
  
  // Try to extract overall score and status first
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

  // Extract KPIs with the defined patterns
  for (const { name, pattern, unit, category } of kpiPatterns) {
    // Only search if this KPI hasn't been found yet
    if (!extractedKpiNames.has(name)) {
      const match = text.match(pattern);
      if (match) {
        const value = parseFloat(match[1]);
        
        // Determine status, either from explicit indication or calculated
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
          
          console.log(`Found KPI with explicit status: ${name} = ${value} with status: ${status}`);
        } else {
          status = determineStatus(name, value);
          console.log(`Found KPI: ${name} = ${value}, determined status: ${status}`);
        }
        
        kpis.push({
          name,
          value,
          target: getDefaultTargetForKPI(name),
          unit,
          trend: "neutral" as "up" | "down" | "neutral",
          status,
          category: category as "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity"
        });
        
        extractedKpiNames.add(name);
      }
    }
  }

  // Search for key-value pairs with percentage signs
  const percentagePatterns = text.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-|\s+)(?:\s*)(\d+(?:\.\d+)?)\s*%/g);
  if (percentagePatterns) {
    percentagePatterns.forEach(match => {
      const parts = match.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-|\s+)(?:\s*)(\d+(?:\.\d+)?)\s*%/);
      if (parts && parts.length >= 3) {
        const kpiName = parts[1].trim();
        const value = parseFloat(parts[2]);
        
        // Check that this is not already an existing KPI
        if (!kpis.some(k => k.name.toLowerCase() === kpiName.toLowerCase()) && 
            !extractedKpiNames.has(kpiName)) {
          
          console.log(`Found percentage KPI: ${kpiName} = ${value}%`);
          
          // Determine category based on KPI name
          let category: "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity" = "safety";
          
          if (kpiName.toLowerCase().includes('safe') || 
              kpiName.toLowerCase().includes('speeding') || 
              kpiName.toLowerCase().includes('mentor') || 
              kpiName.toLowerCase().includes('driver')) {
            category = "safety";
          } else if (kpiName.toLowerCase().includes('compliance') || 
                     kpiName.toLowerCase().includes('audit')) {
            category = "compliance";
          } else if (kpiName.toLowerCase().includes('customer') || 
                     kpiName.toLowerCase().includes('feedback')) {
            category = "customer";
          } else if (kpiName.toLowerCase().includes('photo') || 
                     kpiName.toLowerCase().includes('contact') || 
                     kpiName.toLowerCase().includes('pod')) {
            category = "standardWork";
          } else if (kpiName.toLowerCase().includes('dcr') || 
                     kpiName.toLowerCase().includes('delivery completion')) {
            category = "quality";
          } else if (kpiName.toLowerCase().includes('capacity') || 
                     kpiName.toLowerCase().includes('reliability')) {
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
          
          extractedKpiNames.add(kpiName);
        }
      }
    });
  }

  // Search for DPMO patterns
  const dpmoPatterns = text.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-|\s+)(?:\s*)(\d+(?:\.\d+)?)(?:\s*DPMO)?/g);
  if (dpmoPatterns) {
    dpmoPatterns.forEach(match => {
      // Only process if it contains DPMO, DNR or LoR
      if (match.includes('DPMO') || match.includes('DNR') || match.includes('LoR')) {
        const parts = match.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-|\s+)(?:\s*)(\d+(?:\.\d+)?)(?:\s*DPMO)?/);
        if (parts && parts.length >= 3) {
          const kpiName = parts[1].trim();
          const value = parseFloat(parts[2]);
          
          // Check that this is not already an existing KPI
          if (!kpis.some(k => k.name.toLowerCase() === kpiName.toLowerCase()) && 
              !extractedKpiNames.has(kpiName)) {
            
            console.log(`Found DPMO KPI: ${kpiName} = ${value}`);
            
            // Determine category based on KPI name
            let category: "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity" = "quality";
            
            if (kpiName.toLowerCase().includes('customer') || 
                kpiName.toLowerCase().includes('escalation')) {
              category = "customer";
            } else if (kpiName.toLowerCase().includes('dnr') || 
                      kpiName.toLowerCase().includes('lor')) {
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
            
            extractedKpiNames.add(kpiName);
          }
        }
      }
    });
  }

  // Search for numeric values (like FICO) without units
  const numericPatterns = text.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-|\s+)(?:\s*)(\d+(?:\.\d+)?)(?!\s*%|\s*DPMO)/g);
  if (numericPatterns) {
    numericPatterns.forEach(match => {
      const parts = match.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-|\s+)(?:\s*)(\d+(?:\.\d+)?)(?!\s*%|\s*DPMO)/);
      if (parts && parts.length >= 3) {
        const kpiName = parts[1].trim();
        const value = parseFloat(parts[2]);
        
        // Check that this is not already an existing KPI and it's likely a KPI (not just any number)
        if (!kpis.some(k => k.name.toLowerCase() === kpiName.toLowerCase()) && 
            !extractedKpiNames.has(kpiName) &&
            kpiName.length > 3 && 
            !kpiName.toLowerCase().includes('week') && 
            !kpiName.toLowerCase().includes('date')) {
            
          console.log(`Found numeric KPI: ${kpiName} = ${value}`);
          
          // Determine category based on KPI name
          let category: "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity" | undefined;
          
          if (kpiName.toLowerCase().includes('fico') || 
              kpiName.toLowerCase().includes('safe driving')) {
            category = "safety";
          } else if (kpiName.toLowerCase().includes('breach') || 
                    kpiName.toLowerCase().includes('boc')) {
            category = "compliance";
          }
          
          kpis.push({
            name: kpiName,
            value,
            target: kpiName.toLowerCase().includes('fico') ? 800 : 100, // Default targets
            unit: "",
            trend: "neutral" as "up" | "down" | "neutral",
            status: determineStatus(kpiName, value),
            category
          });
          
          extractedKpiNames.add(kpiName);
        }
      }
    });
  }

  // Search for tables in text (for the new KW14+ format)
  // These are often represented by multiple lines with regular spacing
  const lines = text.split('\n');
  
  // Look for lines with KPI names and values
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip short or empty lines
    if (line.length < 5) continue;
    
    // Look for lines with KPI name on the left side and values on the right
    const kpiValueMatch = line.match(/([A-Za-z][A-Za-z\s\(\)\/\-]+)(?::|–|—|-|\s{2,})(?:\s*)(\d+(?:\.\d+)?)\s*(%|DPMO)?(?:\s*(?:\||\s+)?\s*(poor|fair|great|fantastic|in compliance|not in compliance))?/i);
    
    if (kpiValueMatch) {
      const kpiName = kpiValueMatch[1].trim();
      const value = parseFloat(kpiValueMatch[2]);
      const unit = kpiValueMatch[3] || "";
      
      // Determine status
      let status: KPIStatus | undefined;
      if (kpiValueMatch[4]) {
        const statusText = kpiValueMatch[4].toLowerCase();
        if (statusText === "poor") status = "poor";
        else if (statusText === "fair") status = "fair";
        else if (statusText === "great") status = "great";
        else if (statusText === "fantastic") status = "fantastic";
        else if (statusText === "in compliance") status = "in compliance";
        else if (statusText === "not in compliance") status = "not in compliance";
      }
      
      // Check that this is not already an existing KPI
      if (!kpis.some(k => k.name.toLowerCase() === kpiName.toLowerCase()) && 
          !extractedKpiNames.has(kpiName) &&
          kpiName.length > 3 && 
          !kpiName.toLowerCase().includes('week') && 
          !kpiName.toLowerCase().includes('date')) {
          
        console.log(`Found KPI from table row: ${kpiName} = ${value}${unit} ${status ? `(${status})` : ''}`);
        
        // Determine category based on KPI name
        let category: "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity";
        
        if (kpiName.toLowerCase().includes('safe') || 
            kpiName.toLowerCase().includes('speeding') || 
            kpiName.toLowerCase().includes('mentor') ||
            kpiName.toLowerCase().includes('driver') ||
            kpiName.toLowerCase().includes('fico')) {
          category = "safety";
        } else if (kpiName.toLowerCase().includes('compliance') || 
                  kpiName.toLowerCase().includes('audit') ||
                  kpiName.toLowerCase().includes('breach') || 
                  kpiName.toLowerCase().includes('boc') ||
                  kpiName.toLowerCase().includes('cas') ||
                  kpiName.toLowerCase().includes('whc')) {
          category = "compliance";
        } else if (kpiName.toLowerCase().includes('customer') || 
                  kpiName.toLowerCase().includes('escalation') ||
                  kpiName.toLowerCase().includes('feedback') ||
                  kpiName.toLowerCase().includes('csat') ||
                  kpiName.toLowerCase().includes('concession')) {
          category = "customer";
        } else if (kpiName.toLowerCase().includes('photo') || 
                  kpiName.toLowerCase().includes('contact') ||
                  kpiName.toLowerCase().includes('pod') ||
                  kpiName.toLowerCase().includes('rtd') ||
                  kpiName.toLowerCase().includes('dtd')) {
          category = "standardWork";
        } else if (kpiName.toLowerCase().includes('dcr') || 
                  kpiName.toLowerCase().includes('dnr') ||
                  kpiName.toLowerCase().includes('lor') ||
                  kpiName.toLowerCase().includes('delivery completion')) {
          category = "quality";
        } else if (kpiName.toLowerCase().includes('capacity') || 
                  kpiName.toLowerCase().includes('reliability')) {
          category = "capacity";
        } else {
          // Default category based on unit
          if (unit === "DPMO") {
            category = "quality";
          } else {
            category = "safety";
          }
        }
        
        // Set standard values for the unit
        let finalUnit = unit;
        if (unit === "%") {
          finalUnit = "%";
        } else if (unit === "DPMO") {
          finalUnit = "DPMO";
        } else {
          finalUnit = "";
        }
        
        // Set target based on unit and category
        let target: number;
        if (finalUnit === "%") {
          target = 95;
        } else if (finalUnit === "DPMO") {
          target = 3000;
        } else if (kpiName.toLowerCase().includes('fico')) {
          target = 800;
        } else {
          target = 100;
        }
        
        kpis.push({
          name: kpiName,
          value,
          target,
          unit: finalUnit,
          trend: "neutral" as "up" | "down" | "neutral",
          status: status || determineStatus(kpiName, value),
          category
        });
        
        extractedKpiNames.add(kpiName);
      }
    }
  }
  
  console.log(`Final KPI count: ${kpis.length}`);
  
  if (kpis.length === 0) {
    console.warn("No company KPIs extracted, returning default set");
    return [
      {
        name: "Delivery Completion Rate (DCR)",
        value: 98.5,
        target: 98.0,
        unit: "%",
        trend: "up" as const,
        status: "fantastic" as const,
        category: "quality" as const
      },
      {
        name: "Delivered Not Received (DNR DPMO)",
        value: 2500,
        target: 3000,
        unit: "DPMO",
        trend: "down" as const,
        status: "great" as const,
        category: "quality" as const
      },
      {
        name: "Customer escalation DPMO",
        value: 41,
        target: 50,
        unit: "DPMO",
        trend: "down" as const,
        status: "great" as const,
        category: "customer" as const
      }
    ];
  }
  
  return kpis;
};
