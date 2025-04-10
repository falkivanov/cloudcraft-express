
/**
 * Entry point for driver KPI extraction
 * 
 * This file provides a unified API for extracting driver KPIs
 * using multiple strategies and selecting the best results.
 */

import { DriverKPI } from '../../../../types';
import { extractDriverKPIsFromText } from './textExtractor';
import { extractDriverKPIsFromStructure } from './structural/structuralExtractor';

/**
 * Extract driver KPIs using multiple strategies and select the best result
 * Enhanced to support structured table formats
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
  
  // Check for common formatting patterns that indicate a structured table
  // This helps identify PDF spreadsheet exports or machine-readable tables
  const hasStructuredTablePattern = 
    /A\w{13,14}\s+\d+(\.\d+)?\s+\d+(\.\d+)?%?\s+\d+\s+\d+(\.\d+)?%?\s+\d+(\.\d+)?%?/.test(text);
  
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
  
  // Regular expression to match driver rows with numeric values
  // Pattern: A-prefixed ID followed by several numeric values
  const rowPattern = /\b(A\w{6,14})\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%?\s+(\d+)\s+(\d+(?:\.\d+)?)%?\s+(\d+(?:\.\d+)?)%?\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%?/g;
  
  let match;
  while ((match = rowPattern.exec(text)) !== null) {
    const driverId = match[1];
    
    // Extract all numeric values
    const values = [
      parseFloat(match[2]), // Delivered
      parseFloat(match[3]), // DCR
      parseFloat(match[4]), // DNR DPMO
      parseFloat(match[5]), // POD
      parseFloat(match[6]), // CC
      parseFloat(match[7]), // CE
      parseFloat(match[8])  // DEX
    ];
    
    // Create metrics
    const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
    const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
    const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
    
    const metrics = metricNames.map((name, i) => ({
      name,
      value: values[i],
      target: metricTargets[i],
      unit: metricUnits[i],
      status: determineMetricStatus(name, values[i])
    }));
    
    drivers.push({
      name: driverId,
      status: "active",
      metrics
    });
  }
  
  // If standard pattern didn't find enough drivers, try a more flexible pattern
  if (drivers.length < 5) {
    // More flexible pattern that's less strict about spacing and formatting
    const flexiblePattern = /(A\w{6,14})\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/g;
    
    let flexMatch;
    while ((flexMatch = flexiblePattern.exec(text)) !== null) {
      // Skip if we already have this driver
      const driverId = flexMatch[1];
      if (drivers.some(d => d.name === driverId)) continue;
      
      // Extract all numeric values
      const values = [
        parseFloat(flexMatch[2]), // Delivered
        parseFloat(flexMatch[3]), // DCR
        parseFloat(flexMatch[4]), // DNR DPMO
        parseFloat(flexMatch[5]), // POD
        parseFloat(flexMatch[6]), // CC
        parseFloat(flexMatch[7]), // CE
        parseFloat(flexMatch[8])  // DEX
      ];
      
      // Create metrics
      const metricNames = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
      const metricTargets = [0, 98.5, 1500, 98, 95, 0, 95];
      const metricUnits = ["", "%", "DPMO", "%", "%", "", "%"];
      
      const metrics = metricNames.map((name, i) => ({
        name,
        value: values[i],
        target: metricTargets[i],
        unit: metricUnits[i],
        status: determineMetricStatus(name, values[i])
      }));
      
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
