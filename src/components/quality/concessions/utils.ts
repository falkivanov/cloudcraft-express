
/**
 * Format a number as currency (€)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
}

/**
 * Format a date string to a localized format
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
  } catch (e) {
    return dateString;
  }
}

/**
 * Group concessions by reason and calculate total cost per reason
 */
export function groupByReason(items: Array<{ reason: string; cost: number }>) {
  const groups: Record<string, { count: number; totalCost: number }> = {};
  
  items.forEach(item => {
    const reason = item.reason || 'Unbekannt';
    if (!groups[reason]) {
      groups[reason] = { count: 0, totalCost: 0 };
    }
    groups[reason].count += 1;
    groups[reason].totalCost += item.cost;
  });
  
  return Object.entries(groups).map(([reason, data]) => ({
    reason,
    count: data.count,
    totalCost: data.totalCost
  }));
}
