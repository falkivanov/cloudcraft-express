
/**
 * Entry point for driver KPI extraction
 * 
 * This file provides a unified API for extracting driver KPIs
 * using multiple strategies and selecting the best results.
 */

import { DriverKPI } from '../../../../types';
import { extractDriverKPIsFromText } from './textExtractor';
import { extractDriverKPIsFromStructure } from './structural/structuralExtractor';
import { generateSampleDrivers } from './sampleData';
import { ensureAllMetrics } from './utils/metricUtils';
import { determineMetricStatus } from './utils/metricStatus';

// Export the utility functions so they can be imported elsewhere
export { generateSampleDrivers, ensureAllMetrics };

/**
 * Extract driver KPIs using multiple strategies and select the best result
 * Enhanced to support structured table formats
 */
export function extractDriverKPIs(text: string, pageData?: Record<number, any>): DriverKPI[] {
  console.log("Extracting driver KPIs using multiple strategies");
  
  // Detect if the document is KW14+ format by checking for "LoR DPMO" column
  const isKW14Format = text.includes("LoR DPMO");
  if (isKW14Format) {
    console.log("Detected KW14+ format with LoR DPMO column");
  }
  
  let bestResults: DriverKPI[] = [];
  
  // First try structural extraction if page data is available
  if (pageData && Object.keys(pageData).length > 0) {
    try {
      const structuralResults = extractDriverKPIsFromStructure(pageData);
      console.log(`Structural extraction found ${structuralResults.length} drivers`);
      
      // If we found a good number of drivers, use this result
      if (structuralResults.length >= 5) {
        bestResults = structuralResults;
      }
    } catch (e) {
      console.error("Error during structural driver extraction:", e);
    }
  }
  
  // If structural extraction didn't work well, try text-based extraction
  if (bestResults.length < 5) {
    try {
      const textResults = extractDriverKPIsFromText(text);
      console.log(`Text-based extraction found ${textResults.length} drivers`);
      
      // Use text results if they're better than what we have so far
      if (textResults.length > bestResults.length) {
        bestResults = textResults;
      }
    } catch (e) {
      console.error("Error during text-based driver extraction:", e);
    }
  }
  
  // Check for common formatting patterns that indicate a structured table
  // This helps identify PDF spreadsheet exports or machine-readable tables
  const hasStructuredTablePattern = isKW14Format ?
    /A\w{13,14}\s+\d+(\.\d+)?\s+\d+(\.\d+)?%?\s+\d+\s+\d+\s+(\d+(\.\d+)?%?|-)\s+(\d+(\.\d+)?%?|-)\s+\d+(\.\d+)?%?/.test(text) :
    /A\w{13,14}\s+\d+(\.\d+)?\s+\d+(\.\d+)?%?\s+\d+\s+(\d+(\.\d+)?%?|-)\s+(\d+(\.\d+)?%?|-)\s+\d+(\.\d+)?%?/.test(text);
  
  if (hasStructuredTablePattern && bestResults.length < 10) {
    console.log("Detected structured table pattern, attempting specialized extraction");
    
    try {
      // Apply specialized extraction for structured table data
      const structuredTableResults = extractDriversFromStructuredTable(text, isKW14Format);
      
      if (structuredTableResults.length > bestResults.length) {
        console.log(`Structured table extraction successful with ${structuredTableResults.length} drivers`);
        bestResults = structuredTableResults;
      }
    } catch (e) {
      console.error("Error during structured table extraction:", e);
    }
  }
  
  return bestResults;
}

/**
 * Extract driver data from a structured table format
 * This is specialized for machine-readable tabular PDFs
 * 
 * @param text The text content to extract from
 * @param isKW14Format Whether the document is in the KW14+ format with LoR DPMO column
 */
function extractDriversFromStructuredTable(text: string, isKW14Format: boolean = false): DriverKPI[] {
  console.log(`Attempting to extract drivers from structured table format (${isKW14Format ? "KW14+" : "pre-KW14"} format)`);
  const drivers: DriverKPI[] = [];
  
  // Regular expression to match driver rows with numeric values and dash placeholders
  // KW14+ pattern includes LoR DPMO column
  const rowPattern = isKW14Format ?
    /\b(A\w{6,14})\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%?\s+(\d+|-)\s+(\d+|-)\s+(\d+(?:\.\d+)?%?|-)\s+(\d+(?:\.\d+)?%?|-)\s+(\d+(?:\.\d+)?|-)\s+(\d+(?:\.\d+)?%?|-)/g :
    /\b(A\w{6,14})\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%?\s+(\d+|-)\s+(\d+(?:\.\d+)?%?|-)\s+(\d+(?:\.\d+)?%?|-)\s+(\d+(?:\.\d+)?|-)\s+(\d+(?:\.\d+)?%?|-)/g;
  
  let match;
  while ((match = rowPattern.exec(text)) !== null) {
    const driverId = match[1];
    
    if (isKW14Format) {
      // Extract values for KW14+ format, handling dashes as special cases
      const values = [
        parseFloat(match[2]) || 0,                                // Delivered
        parseFloat(match[3].replace('%', '')) || 0,               // DCR
        match[4] === '-' ? 0 : parseFloat(match[4]) || 0,         // DNR DPMO
        match[5] === '-' ? 0 : parseFloat(match[5]) || 0,         // LoR DPMO
        match[6] === '-' ? 0 : parseFloat(match[6].replace('%', '')) || 0,  // POD
        match[7] === '-' ? 0 : parseFloat(match[7].replace('%', '')) || 0,  // CC
        match[8] === '-' ? 0 : parseFloat(match[8]) || 0,         // CE
        match[9] === '-' ? 0 : parseFloat(match[9].replace('%', '')) || 0   // DEX
      ];
      
      // Create metrics for KW14+ format
      const metricNames = ["Delivered", "DCR", "DNR DPMO", "LoR DPMO", "POD", "CC", "CE", "DEX"];
      const metricTargets = [0, 98.5, 1500, 1000, 98, 95, 0, 95];
      const metricUnits = ["", "%", "DPMO", "DPMO", "%", "%", "", "%"];
      
      const metrics = metricNames.map((name, i) => {
        const isDash = (i === 2 && match[4] === '-') ||   // DNR DPMO is dash
                       (i === 3 && match[5] === '-') ||   // LoR DPMO is dash
                       (i === 4 && match[6] === '-') ||   // POD is dash
                       (i === 5 && match[7] === '-') ||   // CC is dash
                       (i === 6 && match[8] === '-') ||   // CE is dash
                       (i === 7 && match[9] === '-');     // DEX is dash
        
        return {
          name,
          value: values[i],
          target: metricTargets[i],
          unit: metricUnits[i],
          status: isDash ? "none" : determineMetricStatus(name, values[i])
        };
      });
      
      drivers.push({
        name: driverId,
        status: "active",
        metrics
      });
    } else {
      // Extract values for pre-KW14 format, handling dashes as special cases
      const values = [
        parseFloat(match[2]) || 0,                                // Delivered
        parseFloat(match[3].replace('%', '')) || 0,               // DCR
        match[4] === '-' ? 0 : parseFloat(match[4]) || 0,         // DNR DPMO
        match[5] === '-' ? 0 : parseFloat(match[5].replace('%', '')) || 0,  // POD
        match[6] === '-' ? 0 : parseFloat(match[6].replace('%', '')) || 0,  // CC
        match[7] === '-' ? 0 : parseFloat(match[7]) || 0,         // CE
        match[8] === '-' ? 0 : parseFloat(match[8].replace('%', '')) || 0   // DEX
      ];
      
      // Create metrics for pre-KW14 format
      const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
      const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
      const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
      
      const metrics = metricNames.map((name, i) => {
        const isDash = (i === 2 && match[4] === '-') ||   // DNR DPMO is dash
                       (i === 3 && match[5] === '-') ||   // POD is dash
                       (i === 4 && match[6] === '-') ||   // CC is dash
                       (i === 5 && match[7] === '-') ||   // CE is dash
                       (i === 6 && match[8] === '-');     // DEX is dash
        
        return {
          name,
          value: values[i],
          target: metricTargets[i],
          unit: metricUnits[i],
          status: isDash ? "none" : determineMetricStatus(name, values[i])
        };
      });
      
      drivers.push({
        name: driverId,
        status: "active",
        metrics
      });
    }
  }
  
  // If standard pattern didn't find enough drivers, try more flexible patterns
  if (drivers.length < 5) {
    // Try to detect the format by scanning for column headers
    const hasLorColumn = /\bLo[rR] DPMO\b/.test(text);
    
    if (hasLorColumn || isKW14Format) {
      console.log("Trying alternative pattern for tables with LoR DPMO column");
      // More flexible pattern for KW14+ format
      tryFlexibleKW14Pattern(text, drivers);
    } else {
      console.log("Trying alternative pattern for standard table format");
      // More flexible pattern for pre-KW14 format
      tryFlexiblePreKW14Pattern(text, drivers);
    }
  }
  
  return drivers;
}

/**
 * Try to extract driver data using a flexible pattern for KW14+ format
 */
function tryFlexibleKW14Pattern(text: string, drivers: DriverKPI[]): void {
  // Set of driver IDs already processed to avoid duplicates
  const processedIds = new Set(drivers.map(d => d.name));
  
  // More flexible pattern for KW14+ format
  const flexPattern = /\b(A\w{6,14})\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?%?)\s+(\d+|-)\s+(\d+|-)\s+(\d+(?:\.\d+)?%?|-)\s+(\d+(?:\.\d+)?%?|-)\s+(\d+(?:\.\d+)?|-)\s+(\d+(?:\.\d+)?%?|-)/g;
  
  let flexMatch;
  while ((flexMatch = flexPattern.exec(text)) !== null) {
    const driverId = flexMatch[1];
    
    // Skip if we already have this driver
    if (processedIds.has(driverId)) continue;
    
    // Extract values, handling dashes as special cases
    const values = [
      parseFloat(flexMatch[2]) || 0,                                  // Delivered
      parseFloat(flexMatch[3].replace('%', '')) || 0,                 // DCR
      flexMatch[4] === '-' ? 0 : parseFloat(flexMatch[4]) || 0,       // DNR DPMO
      flexMatch[5] === '-' ? 0 : parseFloat(flexMatch[5]) || 0,       // LoR DPMO
      flexMatch[6] === '-' ? 0 : parseFloat(flexMatch[6].replace('%', '')) || 0,  // POD
      flexMatch[7] === '-' ? 0 : parseFloat(flexMatch[7].replace('%', '')) || 0,  // CC
      flexMatch[8] === '-' ? 0 : parseFloat(flexMatch[8]) || 0,       // CE
      flexMatch[9] === '-' ? 0 : parseFloat(flexMatch[9].replace('%', '')) || 0   // DEX
    ];
    
    // Create metrics
    const metricNames = ["Delivered", "DCR", "DNR DPMO", "LoR DPMO", "POD", "CC", "CE", "DEX"];
    const metricTargets = [0, 98.5, 1500, 1000, 98, 95, 0, 95];
    const metricUnits = ["", "%", "DPMO", "DPMO", "%", "%", "", "%"];
    
    const metrics = metricNames.map((name, i) => {
      const isDash = (i === 2 && flexMatch[4] === '-') ||   // DNR DPMO is dash
                     (i === 3 && flexMatch[5] === '-') ||   // LoR DPMO is dash
                     (i === 4 && flexMatch[6] === '-') ||   // POD is dash
                     (i === 5 && flexMatch[7] === '-') ||   // CC is dash
                     (i === 6 && flexMatch[8] === '-') ||   // CE is dash
                     (i === 7 && flexMatch[9] === '-');     // DEX is dash
      
      return {
        name,
        value: values[i],
        target: metricTargets[i],
        unit: metricUnits[i],
        status: isDash ? "none" : determineMetricStatus(name, values[i])
      };
    });
    
    drivers.push({
      name: driverId,
      status: "active",
      metrics
    });
    
    processedIds.add(driverId);
  }
  
  // Try line by line extraction if still not enough drivers
  if (drivers.length < 10) {
    const lines = text.split('\n');
    for (const line of lines) {
      // Look for lines that start with an A-prefixed ID
      if (/^A\w{6,14}\s/.test(line)) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 8) {
          const driverId = parts[0];
          
          // Skip if already processed
          if (processedIds.has(driverId)) continue;
          
          // Extract values from parts array
          try {
            const values = [
              parseFloat(parts[1]) || 0,                                // Delivered
              parseFloat(parts[2].replace('%', '')) || 0,               // DCR
              parts[3] === '-' ? 0 : parseFloat(parts[3]) || 0,         // DNR DPMO
              parts[4] === '-' ? 0 : parseFloat(parts[4]) || 0,         // LoR DPMO
              parts[5] === '-' ? 0 : parseFloat(parts[5].replace('%', '')) || 0,  // POD
              parts[6] === '-' ? 0 : parseFloat(parts[6].replace('%', '')) || 0,  // CC
              parts[7] === '-' ? 0 : parseFloat(parts[7]) || 0,         // CE
              parts.length > 8 ? (parts[8] === '-' ? 0 : parseFloat(parts[8].replace('%', '')) || 0) : 0   // DEX
            ];
            
            // Create metrics
            const metricNames = ["Delivered", "DCR", "DNR DPMO", "LoR DPMO", "POD", "CC", "CE", "DEX"];
            const metricTargets = [0, 98.5, 1500, 1000, 98, 95, 0, 95];
            const metricUnits = ["", "%", "DPMO", "DPMO", "%", "%", "", "%"];
            
            const metrics = metricNames.map((name, i) => {
              const isDash = i < parts.length && parts[i + 1] === '-'; // i + 1 because parts[0] is the ID
              
              return {
                name,
                value: i < values.length ? values[i] : 0,
                target: metricTargets[i],
                unit: metricUnits[i],
                status: isDash ? "none" : determineMetricStatus(name, i < values.length ? values[i] : 0)
              };
            });
            
            drivers.push({
              name: driverId,
              status: "active",
              metrics
            });
            
            processedIds.add(driverId);
          } catch (error) {
            console.error(`Error processing line for driver ${driverId}:`, error);
          }
        }
      }
    }
  }
}

/**
 * Try to extract driver data using a flexible pattern for pre-KW14 format
 */
function tryFlexiblePreKW14Pattern(text: string, drivers: DriverKPI[]): void {
  // Set of driver IDs already processed to avoid duplicates
  const processedIds = new Set(drivers.map(d => d.name));
  
  // Flexible pattern for pre-KW14 format
  const flexPattern = /\b(A\w{6,14}|TR-\d{3})\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?%?)\s+(\d+|-)\s+(\d+(?:\.\d+)?%?|-)\s+(\d+(?:\.\d+)?%?|-)\s+(\d+(?:\.\d+)?|-)\s+(\d+(?:\.\d+)?%?|-)/g;
  
  let flexMatch;
  while ((flexMatch = flexPattern.exec(text)) !== null) {
    const driverId = flexMatch[1];
    
    // Skip if we already have this driver
    if (processedIds.has(driverId)) continue;
    
    // Extract values, handling dashes as special cases
    const values = [
      parseFloat(flexMatch[2]) || 0,                                // Delivered
      parseFloat(flexMatch[3].replace('%', '')) || 0,               // DCR
      flexMatch[4] === '-' ? 0 : parseFloat(flexMatch[4]) || 0,     // DNR DPMO
      flexMatch[5] === '-' ? 0 : parseFloat(flexMatch[5].replace('%', '')) || 0,  // POD
      flexMatch[6] === '-' ? 0 : parseFloat(flexMatch[6].replace('%', '')) || 0,  // CC
      flexMatch[7] === '-' ? 0 : parseFloat(flexMatch[7]) || 0,     // CE
      flexMatch[8] === '-' ? 0 : parseFloat(flexMatch[8].replace('%', '')) || 0   // DEX
    ];
    
    // Create metrics
    const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
    const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
    const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
    
    const metrics = metricNames.map((name, i) => {
      const isDash = (i === 2 && flexMatch[4] === '-') ||   // DNR DPMO is dash
                     (i === 3 && flexMatch[5] === '-') ||   // POD is dash
                     (i === 4 && flexMatch[6] === '-') ||   // CC is dash
                     (i === 5 && flexMatch[7] === '-') ||   // CE is dash
                     (i === 6 && flexMatch[8] === '-');     // DEX is dash
      
      return {
        name,
        value: values[i],
        target: metricTargets[i],
        unit: metricUnits[i],
        status: isDash ? "none" : determineMetricStatus(name, values[i])
      };
    });
    
    drivers.push({
      name: driverId,
      status: "active",
      metrics
    });
    
    processedIds.add(driverId);
  }
}

// Use the imported determineMetricStatus function from utils/metricStatus.ts
// Removed the local function definition that was causing the conflict
