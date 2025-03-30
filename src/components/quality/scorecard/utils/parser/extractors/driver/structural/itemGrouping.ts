
/**
 * Helper functions for grouping PDF items into rows
 */

/**
 * Group PDF items into rows based on their y-coordinates
 */
export function groupItemsIntoRows(items: any[]): any[][] {
  const rows: any[][] = [];
  let currentRow: any[] = [];
  let lastY = -1;
  
  // Sort items by y-coordinate (top to bottom)
  const sortedItems = [...items].sort((a, b) => b.y - a.y);
  
  // Group into rows with flexible tolerance to handle table rows
  for (const item of sortedItems) {
    if (lastY === -1 || Math.abs(item.y - lastY) < 12) {  // Increased tolerance
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
  
  // Add the last row if any items remain
  if (currentRow.length > 0) {
    rows.push([...currentRow].sort((a, b) => a.x - b.x));
  }
  
  return rows;
}
