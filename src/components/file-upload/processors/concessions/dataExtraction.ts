
import { ConcessionItem } from "@/components/quality/concessions/types";
import { normalizeWeekFormat } from "./weekUtils";

/**
 * Extract and transform concession items from raw data
 * @param rawData Raw data from Excel file
 * @param columnIndices Indices of required columns
 * @param currentWeek Current week identifier for filtering
 * @returns Object with items organized by week and all items
 */
export function extractConcessionItems(
  rawData: any[][],
  columnIndices: {
    weekColIndex: number;
    transportIdColIndex: number;
    trackingIdColIndex: number;
    deliveryDateColIndex: number;
    reasonColIndex: number;
    costColIndex: number;
  },
  currentWeek: string
) {
  const { 
    weekColIndex, 
    transportIdColIndex, 
    trackingIdColIndex, 
    deliveryDateColIndex, 
    reasonColIndex, 
    costColIndex 
  } = columnIndices;
  
  const concessionItems: ConcessionItem[] = [];
  const allConcessionItems: ConcessionItem[] = [];
  const weekToItems: Record<string, ConcessionItem[]> = {};
  
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    
    // Skip empty rows
    if (!row || row.length === 0) continue;
    
    // Extract week value
    let weekValue = "";
    if (weekColIndex !== -1) {
      weekValue = row[weekColIndex]?.toString() || "";
      if (!weekValue) continue;
      
      // Normalize week format
      weekValue = normalizeWeekFormat(weekValue);
    } else {
      // If we couldn't find a week column, assign all items to the current week
      weekValue = currentWeek;
    }
    
    // Extract the values we need
    const transportId = row[transportIdColIndex]?.toString() || "";
    const trackingId = row[trackingIdColIndex]?.toString() || "";
    let deliveryDate = row[deliveryDateColIndex];
    
    if (deliveryDate instanceof Date) {
      deliveryDate = deliveryDate.toISOString();
    } else {
      deliveryDate = deliveryDate?.toString() || "";
    }
    
    const reason = row[reasonColIndex]?.toString() || "";
    let cost = 0;
    if (row[costColIndex] !== undefined && row[costColIndex] !== null) {
      const costVal = parseFloat(row[costColIndex].toString());
      if (!isNaN(costVal)) {
        cost = costVal;
      }
    }
    
    const item = {
      transportId,
      trackingId,
      deliveryDateTime: deliveryDate,
      reason,
      cost
    };
    
    // Store all items and organize by week
    allConcessionItems.push(item);
    
    if (!weekToItems[weekValue]) {
      weekToItems[weekValue] = [];
    }
    weekToItems[weekValue].push(item);
    
    // Also add to current week items if it matches
    if (weekValue.toUpperCase() === currentWeek.toUpperCase()) {
      concessionItems.push(item);
    }
  }
  
  return {
    concessionItems,
    allConcessionItems,
    weekToItems
  };
}

/**
 * Get a sorted list of available weeks
 */
export function getSortedAvailableWeeks(weekToItems: Record<string, any[]>) {
  return Object.keys(weekToItems).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''));
    const numB = parseInt(b.replace(/\D/g, ''));
    return numB - numA; // descending order
  });
}
