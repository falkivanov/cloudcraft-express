/**
 * Entry point for driver KPI extraction
 * 
 * This file provides a unified API for extracting driver KPIs
 * using multiple strategies and selecting the best results.
 * Vorbereitet für zukünftige API-Integration.
 */

import { DriverKPI } from '../../../../types';
import { extractDriverKPIsFromText } from './textExtractor';
import { extractDriverKPIsFromStructure } from './structural/structuralExtractor';
import { generateSampleDrivers } from './sampleData';
import { ensureAllMetrics } from './utils/metricUtils';

// Export the utility functions so they can be imported elsewhere
export { generateSampleDrivers, ensureAllMetrics };

// API-Konfiguration für zukünftige Integration
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  endpoints: {
    extractDrivers: '/api/v1/scorecard/extract-drivers'
  }
};

/**
 * Extract driver KPIs using multiple strategies and select the best result
 * Enhanced to support structured table formats
 * Vorbereitet für zukünftige API-Integration
 */
export function extractDriverKPIs(text: string, pageData?: Record<number, any>): DriverKPI[] {
  console.log("Extracting driver KPIs using multiple strategies");
  
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
  
  // In Zukunft: API-Aufruf für die Extraktion
  // Hier wäre der Platz für den API-Call, wenn die Backend-Infrastruktur steht
  
  // Check for common formatting patterns that indicate a structured table
  // This helps identify PDF spreadsheet exports or machine-readable tables
  const hasStructuredTablePattern = 
    /A\w{13,14}\s+\d+(\.\d+)?\s+\d+(\.\d+)?%?\s+\d+\s+(\d+(\.\d+)?%?|-)\s+(\d+(\.\d+)?%?|-)\s+\d+(\.\d+)?%?/.test(text);
  
  if (hasStructuredTablePattern && bestResults.length < 10) {
    console.log("Detected structured table pattern, attempting specialized extraction");
    
    try {
      // Apply specialized extraction for structured table data
      const structuredTableResults = extractDriversFromStructuredTable(text);
      
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
 */
function extractDriversFromStructuredTable(text: string): DriverKPI[] {
  console.log("Attempting to extract drivers from structured table format");
  const drivers: DriverKPI[] = [];
  
  // Regular expression to match driver rows with numeric values and dash placeholders
  // Pattern: A-prefixed ID followed by several numeric values, with possible dash placeholders
  const rowPattern = /\b(A\w{6,14})\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%?\s+(\d+|-)\s+(\d+(?:\.\d+)?%?|-)\s+(\d+(?:\.\d+)?%?|-)\s+(\d+(?:\.\d+)?|-)\s+(\d+(?:\.\d+)?%?|-)/g;
  
  let match;
  while ((match = rowPattern.exec(text)) !== null) {
    const driverId = match[1];
    
    // Extract values, handling dashes as special cases
    const values = [
      parseFloat(match[2]) || 0,                                // Delivered
      parseFloat(match[3].replace('%', '')) || 0,               // DCR
      match[4] === '-' ? 0 : parseFloat(match[4]) || 0,         // DNR DPMO
      match[5] === '-' ? 0 : parseFloat(match[5].replace('%', '')) || 0,  // POD
      match[6] === '-' ? 0 : parseFloat(match[6].replace('%', '')) || 0,  // CC
      match[7] === '-' ? 0 : parseFloat(match[7]) || 0,         // CE
      match[8] === '-' ? 0 : parseFloat(match[8].replace('%', '')) || 0   // DEX
    ];
    
    // Create metrics
    const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
    const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
    const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
    
    const metrics = metricNames.map((name, i) => {
      const isDash = (i === 3 && match[5] === '-') ||   // POD is dash
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
  
  // If standard pattern didn't find enough drivers, try a more flexible pattern
  if (drivers.length < 5) {
    // More flexible pattern that's less strict about spacing and formatting
    // Updated to also handle dash values
    const flexiblePattern = /(A\w{6,14})\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?%?)\s+(\d+|-)\s+(\d+(?:\.\d+)?%?|-)\s+(\d+(?:\.\d+)?%?|-)\s+(\d+(?:\.\d+)?|-)\s+(\d+(?:\.\d+)?%?|-)/g;
    
    let flexMatch;
    while ((flexMatch = flexiblePattern.exec(text)) !== null) {
      // Skip if we already have this driver
      const driverId = flexMatch[1];
      if (drivers.some(d => d.name === driverId)) continue;
      
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
        const isDash = (i === 3 && flexMatch[5] === '-') ||   // POD is dash
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
    }
  }
  
  return drivers;
}

/**
 * Determine status for a metric
 */
function determineMetricStatus(metricName: string, value: number): "fantastic" | "great" | "fair" | "poor" | "none" {
  // Values that couldn't be parsed might be NaN
  if (isNaN(value)) return "none";
  
  switch (metricName) {
    case "Delivered":
      return value > 1000 ? "fantastic" : value > 800 ? "great" : value > 500 ? "fair" : "poor";
    
    case "DCR":
      if (value >= 99) return "fantastic";
      if (value >= 98.5) return "great";
      if (value >= 95) return "fair";
      return "poor";
    
    case "DNR DPMO":
      if (value <= 1000) return "fantastic";
      if (value <= 1500) return "great";
      if (value <= 2500) return "fair";
      return "poor";
    
    case "POD":
      if (value >= 99) return "fantastic";
      if (value >= 98) return "great";
      if (value >= 95) return "fair";
      return "poor";
    
    case "CC":
      if (value >= 97) return "fantastic";
      if (value >= 95) return "great";
      if (value >= 90) return "fair";
      return "poor";
    
    case "CE":
      return value === 0 ? "fantastic" : value <= 1 ? "great" : value <= 3 ? "fair" : "poor";
    
    case "DEX":
      if (value >= 97) return "fantastic";
      if (value >= 95) return "great";
      if (value >= 90) return "fair";
      return "poor";
    
    default:
      return "fair";
  }
}
