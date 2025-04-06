
/**
 * Utilities for detecting columns in concessions Excel files
 */

/**
 * Find column index based on flexible pattern matching
 */
export function findColumnIndex(headers: any[], patterns: string[]): number {
  for (const pattern of patterns) {
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]?.toString().toLowerCase() || "";
      if (header.includes(pattern)) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Find all required column indices in the Excel file
 */
export function findRequiredColumns(headers: any[]) {
  // Define possible column name patterns - updated with exact column names
  const weekPatterns = ["wk", "week", "kw", "kalenderwoche"];
  const transportIdPatterns = ["transporter_id", "transport id", "transport-id", "transport_id", "transportid"];
  const trackingIdPatterns = ["tracking_id", "tracking id", "tracking-id", "tracking_id", "trackingid"];
  const deliveryDatePatterns = ["delivery_date_time", "delivery date", "delivery-date", "delivery_date", "deliverydate", "datum"];
  const reasonPatterns = ["shipment_reason", "shipment reason", "reason code", "reason", "grund"];
  const costPatterns = ["concession cost", "Concession Cost", "cost", "kosten", "amount"];
  
  // Find columns using flexible matching
  const weekColIndex = findColumnIndex(headers, weekPatterns);
  const transportIdColIndex = findColumnIndex(headers, transportIdPatterns);
  const trackingIdColIndex = findColumnIndex(headers, trackingIdPatterns);
  const deliveryDateColIndex = findColumnIndex(headers, deliveryDatePatterns);
  const reasonColIndex = findColumnIndex(headers, reasonPatterns);
  const costColIndex = findColumnIndex(headers, costPatterns);

  return {
    weekColIndex,
    transportIdColIndex,
    trackingIdColIndex,
    deliveryDateColIndex,
    reasonColIndex,
    costColIndex
  };
}

/**
 * Validate that all required columns are present
 * Returns a list of missing columns, empty if all required columns are found
 */
export function validateRequiredColumns(columnIndices: ReturnType<typeof findRequiredColumns>) {
  const { transportIdColIndex, trackingIdColIndex, deliveryDateColIndex, reasonColIndex, costColIndex } = columnIndices;
  
  const missingColumns = [];
  if (transportIdColIndex === -1) missingColumns.push("Transport ID");
  if (trackingIdColIndex === -1) missingColumns.push("Tracking ID");
  if (deliveryDateColIndex === -1) missingColumns.push("Delivery Date");
  if (reasonColIndex === -1) missingColumns.push("Shipment Reason");
  if (costColIndex === -1) missingColumns.push("Concession Cost");
  
  return missingColumns;
}
