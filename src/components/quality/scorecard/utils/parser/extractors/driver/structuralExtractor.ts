
import { determineStatus } from '../../../helpers/statusHelper';
import { extractDriverKPIsFromText } from './textExtractor';
import { extractNumericValues } from '../valueExtractor';
import { DriverKPI } from '../../../../types';

/**
 * Extract driver KPIs from structural analysis of the PDF
 */
export const extractDriverKPIsFromStructure = (pageData: Record<number, any>): DriverKPI[] => {
  console.log("Extracting driver KPIs with structural analysis");
  
  // We'll focus on pages 3 and 4 which typically contain driver data
  const relevantPages = [3, 4].filter(num => pageData[num]);
  const drivers: DriverKPI[] = [];
  
  // Look for driver patterns in relevant pages
  for (const pageNum of relevantPages) {
    const page = pageData[pageNum];
    
    // Skip if page doesn't exist
    if (!page) continue;
    
    console.log(`Analyzing page ${pageNum} for driver data`);
    
    // Group items by rows based on y-coordinate
    const rows: any[][] = [];
    let currentRow: any[] = [];
    let lastY = -1;
    
    // Sort items by y-coordinate (top to bottom)
    const sortedItems = [...page.items].sort((a, b) => b.y - a.y);
    
    // Group into rows
    for (const item of sortedItems) {
      if (lastY === -1 || Math.abs(item.y - lastY) < 5) {
        // Same row
        currentRow.push(item);
      } else {
        // New row
        if (currentRow.length > 0) {
          rows.push([...currentRow].sort((a, b) => a.x - b.x)); // Sort by x within row
          currentRow = [item];
        } else {
          currentRow = [item];
        }
      }
      lastY = item.y;
    }
    if (currentRow.length > 0) {
      rows.push([...currentRow].sort((a, b) => a.x - b.x));
    }
    
    // Look for driver table headers to identify metric columns
    const metricNames = ["Delivered", "DNR DPMO", "Contact Compliance", "POD", "DEX", "CE"];
    let foundMetricColumns: {name: string, index: number}[] = [];
    
    // Search for table headers
    for (const row of rows) {
      const rowText = row.map(item => item.str).join(' ');
      
      // Check if this row might be a header row
      let isHeaderRow = false;
      let columnNames: {name: string, x: number}[] = [];
      
      for (const item of row) {
        const text = item.str.trim();
        // Check if this item matches any of our known metric names
        const matchedMetric = metricNames.find(name => 
          text.toLowerCase().includes(name.toLowerCase()) || 
          (text === "CC" && "Contact Compliance".toLowerCase().includes("compliance"))
        );
        
        if (matchedMetric) {
          isHeaderRow = true;
          // Map "CC" to "Contact Compliance"
          const actualName = text === "CC" ? "Contact Compliance" : matchedMetric;
          columnNames.push({name: actualName, x: item.x});
        }
      }
      
      if (isHeaderRow && columnNames.length > 0) {
        console.log("Found header row with metrics:", columnNames.map(c => c.name).join(", "));
        
        // Sort column names by x position
        columnNames.sort((a, b) => a.x - b.x);
        
        // Store column indices (order-based)
        foundMetricColumns = columnNames.map((col, idx) => ({name: col.name, index: idx}));
        break;
      }
    }
    
    // If we didn't find column headers, use default ordering
    if (foundMetricColumns.length === 0) {
      console.log("No column headers found, using default metrics");
      foundMetricColumns = [
        {name: "Delivered", index: 0},
        {name: "DNR DPMO", index: 1},
        {name: "Contact Compliance", index: 2}
      ];
    }
    
    // Process driver rows - look for rows with driver identifier and numeric values
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowText = row.map(item => item.str).join(' ');
      
      // Check for driver identifier patterns (TR-XXX or names)
      const driverMatch = rowText.match(/TR[-\s]?\d+|[A-Z][a-z]+\s+[A-Z][a-z]+/);
      if (driverMatch) {
        const driverName = driverMatch[0];
        
        // Extract numeric values from this row
        const values = extractNumericValues(rowText);
        
        // If we have numeric values, this is likely a driver row
        if (values.length > 0) {
          console.log(`Found driver: ${driverName} with ${values.length} metric values`);
          
          const metrics = [];
          
          // Map values to metrics using the column order we found
          for (let j = 0; j < Math.min(foundMetricColumns.length, values.length); j++) {
            const metricInfo = foundMetricColumns[j];
            const value = values[j];
            
            // Skip if value wasn't found
            if (value === undefined) continue;
            
            // Determine unit and target based on metric name
            const unit = metricInfo.name.includes("DPMO") ? "DPMO" : "%";
            
            // Set default target based on metric
            let target = 100;
            if (metricInfo.name.includes("DPMO")) target = 3000;
            else if (metricInfo.name === "Contact Compliance") target = 95;
            else if (metricInfo.name === "CE") target = 0;
            
            metrics.push({
              name: metricInfo.name,
              value,
              target,
              unit,
              status: determineStatus(metricInfo.name, value)
            });
          }
          
          // Only add driver if we found some metrics
          if (metrics.length > 0) {
            drivers.push({
              name: driverName,
              status: "active",
              metrics
            });
          }
        }
      }
    }
  }
  
  // If we didn't find any drivers with the structural approach, fall back to regex-based extraction
  if (drivers.length === 0) {
    console.log("No drivers found with structural analysis, trying text-based extraction");
    
    // Try to extract based on text patterns from all pages
    const combinedText = relevantPages.map(pageNum => 
      pageData[pageNum]?.text || ""
    ).join("\n\n");
    
    return extractDriverKPIsFromText(combinedText);
  }
  
  console.log(`Successfully extracted ${drivers.length} drivers`);
  return drivers;
};
