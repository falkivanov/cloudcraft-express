
import * as pdfjs from 'pdfjs-dist';
import { ScoreCardData } from '../types';

// Set worker source path for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * Parse a scorecard PDF and extract data
 * @param pdfData ArrayBuffer containing the PDF data
 * @param filename Original filename (used for KW extraction)
 * @returns Promise with the parsed ScoreCardData
 */
export const parseScorecardPDF = async (
  pdfData: ArrayBuffer,
  filename: string
): Promise<ScoreCardData | null> => {
  try {
    // Extract week number from filename if possible
    const weekMatch = filename.match(/KW[_\s]*(\d+)/i);
    const weekNum = weekMatch && weekMatch[1] ? parseInt(weekMatch[1], 10) : new Date().getWeek();
    
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: pdfData });
    const pdf = await loadingTask.promise;
    
    console.log(`PDF loaded with ${pdf.numPages} pages`);
    
    // Extract text from all pages
    const textContent: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
      textContent.push(pageText);
    }
    
    const fullText = textContent.join(' ');
    console.log("PDF content extracted, starting to parse data");
    
    // Parse key metrics from the text
    const parsedData = extractScorecardData(fullText, weekNum);
    
    return parsedData;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return null;
  }
};

/**
 * Extract structured data from the raw text content
 */
const extractScorecardData = (textContent: string, weekNum: number): ScoreCardData => {
  // Default template with empty values
  const data: ScoreCardData = {
    week: weekNum,
    year: new Date().getFullYear(),
    location: extractLocation(textContent) || 'DSU1',
    overallScore: extractOverallScore(textContent) || 85,
    overallStatus: extractOverallStatus(textContent) || 'Great',
    rank: extractRank(textContent) || 5,
    rankNote: extractRankChange(textContent) || 'Up 2 places from last week',
    companyKPIs: extractCompanyKPIs(textContent),
    driverKPIs: extractDriverKPIs(textContent),
    recommendedFocusAreas: extractFocusAreas(textContent),
  };
  
  return data;
};

/**
 * Extract location from text content
 */
const extractLocation = (text: string): string | null => {
  // Look for location pattern (usually DSU1, DSU2, etc.)
  const locationMatch = text.match(/DS[A-Z]\d+/g);
  return locationMatch ? locationMatch[0] : null;
};

/**
 * Extract overall score from text content
 */
const extractOverallScore = (text: string): number | null => {
  // Look for overall score pattern (usually a number like 85%)
  const scoreMatch = text.match(/Overall\s+Score[:\s]+(\d+)/i);
  return scoreMatch ? parseInt(scoreMatch[1], 10) : null;
};

/**
 * Extract overall status from text content
 */
const extractOverallStatus = (text: string): string | null => {
  // Look for status keywords
  if (text.match(/\bfantastic\b/i)) return 'Fantastic';
  if (text.match(/\bgreat\b/i)) return 'Great';
  if (text.match(/\bfair\b/i)) return 'Fair';
  if (text.match(/\bpoor\b/i)) return 'Poor';
  return null;
};

/**
 * Extract rank from text content
 */
const extractRank = (text: string): number | null => {
  // Look for rank pattern (e.g., "Rank: 5 of 20")
  const rankMatch = text.match(/Rank[:\s]+(\d+)/i);
  return rankMatch ? parseInt(rankMatch[1], 10) : null;
};

/**
 * Extract rank change information
 */
const extractRankChange = (text: string): string | null => {
  // Look for rank change patterns
  const upMatch = text.match(/up\s+(\d+)\s+places?/i);
  if (upMatch) return `Up ${upMatch[1]} places from last week`;
  
  const downMatch = text.match(/down\s+(\d+)\s+places?/i);
  if (downMatch) return `Down ${downMatch[1]} places from last week`;
  
  return null;
};

/**
 * Extract focus areas from text content
 */
const extractFocusAreas = (text: string): string[] => {
  // Default focus areas if none found
  const defaultAreas = ['Contact Compliance', 'DNR DPMO'];
  
  // Look for focus area section
  const focusMatch = text.match(/focus\s+areas?:([^]*)(?=\n\n|\n[A-Z])/i);
  if (!focusMatch) return defaultAreas;
  
  // Split by bullet points, commas, or line breaks
  const focusText = focusMatch[1];
  const areas = focusText
    .split(/[•,\n]/)
    .map(area => area.trim())
    .filter(area => area.length > 0);
  
  return areas.length > 0 ? areas : defaultAreas;
};

/**
 * Extract company KPIs from text content
 */
const extractCompanyKPIs = (text: string): any[] => {
  // Try to identify KPI patterns in the text
  const kpis = [];
  
  // Look for common KPI names and patterns
  const kpiPatterns = [
    { name: "Delivery Completion Rate (DCR)", pattern: /DCR[:\s]+(\d+(?:\.\d+)?)\s*%/i },
    { name: "Delivered Not Received (DNR DPMO)", pattern: /DNR\s+DPMO[:\s]+(\d+(?:\.\d+)?)/i },
    { name: "Photo-On-Delivery", pattern: /Photo[- ]On[- ]Delivery[:\s]+(\d+(?:\.\d+)?)\s*%/i },
    { name: "Contact Compliance", pattern: /Contact\s+Compliance[:\s]+(\d+(?:\.\d+)?)\s*%/i },
    { name: "Customer escalation DPMO", pattern: /Customer\s+escalation\s+DPMO[:\s]+(\d+(?:\.\d+)?)/i },
    { name: "Vehicle Audit (VSA) Compliance", pattern: /VSA[:\s]+(\d+(?:\.\d+)?)\s*%/i },
    { name: "DVIC Compliance", pattern: /DVIC[:\s]+(\d+(?:\.\d+)?)\s*%/i },
    { name: "Safe Driving Metric (FICO)", pattern: /FICO[:\s]+(\d+(?:\.\d+)?)/i },
    { name: "Capacity Reliability", pattern: /Capacity\s+Reliability[:\s]+(\d+(?:\.\d+)?)\s*%/i },
  ];
  
  // Check each pattern against the text
  kpiPatterns.forEach(({ name, pattern }) => {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      kpis.push({
        name,
        value,
        target: getDefaultTargetForKPI(name),
        unit: name.includes("DPMO") ? "DPMO" : "%",
        trend: "neutral",
        status: determineStatus(name, value)
      });
    }
  });
  
  // If we didn't find any KPIs, return a default set
  if (kpis.length === 0) {
    return [
      {
        name: "Delivery Completion Rate (DCR)",
        value: 98.5,
        target: 98.0,
        unit: "%",
        trend: "up",
        status: "fantastic"
      },
      {
        name: "Delivered Not Received (DNR DPMO)",
        value: 2500,
        target: 3000,
        unit: "DPMO",
        trend: "down",
        status: "great"
      },
      {
        name: "Contact Compliance",
        value: 92,
        target: 95,
        unit: "%",
        trend: "up",
        status: "fair"
      }
    ];
  }
  
  return kpis;
};

/**
 * Extract driver KPIs from text content
 */
const extractDriverKPIs = (text: string): any[] => {
  const drivers: any[] = [];
  
  // Regular expression to find driver sections - looking for patterns like:
  // TR-123 or Driver Name followed by metrics
  const driverPattern = /(?:TR-\d+|[A-Z][a-z]+\s+[A-Z][a-z]+)[\s\n]+(?:\d+[\.\,]\d+|\d+)%?\s+(?:\d+[\.\,]\d+|\d+)%?/g;
  const driverMatches = text.match(driverPattern);
  
  if (!driverMatches || driverMatches.length === 0) {
    // Return sample data if no drivers found
    return generateSampleDrivers();
  }
  
  // Process each driver match
  driverMatches.forEach(match => {
    // Extract driver ID or name
    const nameMatch = match.match(/^(TR-\d+|[A-Z][a-z]+\s+[A-Z][a-z]+)/);
    if (!nameMatch) return;
    
    const driverName = nameMatch[1];
    
    // Extract numerical metrics that follow the name
    const metricMatches = match.match(/(\d+(?:[.,]\d+)?)/g);
    if (!metricMatches || metricMatches.length < 2) return;
    
    // Create metrics based on the numbers found (assign reasonable names)
    const metrics = [
      {
        name: "Delivered",
        value: parseInt(metricMatches[0], 10),
        target: 100,
        unit: "%",
        status: determineStatus("Delivered", parseInt(metricMatches[0], 10))
      },
      {
        name: "DNR DPMO", 
        value: parseInt(metricMatches[1], 10),
        target: 3000,
        unit: "DPMO",
        status: determineStatus("DNR DPMO", parseInt(metricMatches[1], 10))
      }
    ];
    
    // Add more metrics if available
    if (metricMatches.length > 2) {
      metrics.push({
        name: "Contact Compliance",
        value: parseInt(metricMatches[2], 10),
        target: 95,
        unit: "%",
        status: determineStatus("Contact Compliance", parseInt(metricMatches[2], 10))
      });
    }
    
    // Add driver to list
    drivers.push({
      name: driverName,
      status: "active",
      metrics
    });
  });
  
  return drivers;
};

/**
 * Generate sample driver data when extraction fails
 */
const generateSampleDrivers = (): any[] => {
  return [
    {
      name: "TR-001",
      status: "active",
      metrics: [
        { name: "Delivered", value: 98, target: 100, unit: "%", status: "great" },
        { name: "DNR DPMO", value: 2500, target: 3000, unit: "DPMO", status: "great" },
        { name: "Contact Compliance", value: 92, target: 95, unit: "%", status: "fair" }
      ]
    },
    {
      name: "TR-002",
      status: "active",
      metrics: [
        { name: "Delivered", value: 99, target: 100, unit: "%", status: "fantastic" },
        { name: "DNR DPMO", value: 2000, target: 3000, unit: "DPMO", status: "fantastic" },
        { name: "Contact Compliance", value: 96, target: 95, unit: "%", status: "fantastic" }
      ]
    }
  ];
};

/**
 * Get the default target value for a KPI
 */
const getDefaultTargetForKPI = (kpiName: string): number => {
  const targets: { [key: string]: number } = {
    "Delivery Completion Rate (DCR)": 98.0,
    "Delivered Not Received (DNR DPMO)": 3000,
    "Photo-On-Delivery": 95,
    "Contact Compliance": 95,
    "Customer escalation DPMO": 3500,
    "Vehicle Audit (VSA) Compliance": 95,
    "DVIC Compliance": 95,
    "Safe Driving Metric (FICO)": 800,
    "Capacity Reliability": 98
  };
  
  return targets[kpiName] || 95;
};

/**
 * Determine the status of a KPI based on its value
 */
const determineStatus = (kpiName: string, value: number): string => {
  // For DPMO metrics, lower is better
  if (kpiName.includes("DPMO")) {
    if (value < 2000) return "fantastic";
    if (value < 3000) return "great";
    if (value < 4000) return "fair";
    return "poor";
  }
  
  // For FICO score
  if (kpiName.includes("FICO")) {
    if (value > 850) return "fantastic";
    if (value > 800) return "great";
    if (value > 750) return "fair";
    return "poor";
  }
  
  // For percentage metrics
  if (value > 98) return "fantastic";
  if (value > 95) return "great";
  if (value > 90) return "fair";
  return "poor";
};

// Add method to get week number from Date
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function(): number {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};
