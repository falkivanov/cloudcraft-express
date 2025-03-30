
/**
 * Utilities for grouping PDF items
 */

/**
 * Group items that are close to each other vertically
 */
export function groupItemsByVerticalProximity(items: any[]) {
  const groups: any[][] = [];
  let currentGroup: any[] = [];
  let lastY = -1;
  
  // Sort by y-position (top to bottom)
  const sortedItems = [...items].sort((a, b) => b.y - a.y);
  
  for (const item of sortedItems) {
    if (lastY === -1 || Math.abs(item.y - lastY) < 20) {
      // Items close together go in the same group
      currentGroup.push(item);
    } else {
      // Start a new group
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = [item];
    }
    lastY = item.y;
  }
  
  // Add the last group if it has items
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }
  
  return groups;
}
