
/**
 * Parse time string to minutes for sorting
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr.includes(':')) return parseFloat(timeStr) || 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours * 60) + (minutes || 0);
}

/**
 * Get risk value for sorting
 */
export function getRiskValue(risk: string | undefined): number {
  if (!risk || risk === '-') return 0;
  if (risk.includes('Low')) return 1;
  if (risk.includes('Medium')) return 2;
  if (risk.includes('High')) return 3;
  return 0;
}
