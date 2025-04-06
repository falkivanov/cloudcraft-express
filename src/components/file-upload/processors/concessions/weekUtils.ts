
/**
 * Utilities for handling week data in concessions files
 */

/**
 * Extract week from filename
 * @param filename The name of the file
 * @returns Extracted week identifier or empty string if not found
 */
export function extractWeekFromFilename(filename: string): string {
  // Try matching "Week XX" or "KW XX" patterns (case insensitive)
  const weekPatterns = [
    /(?:week|kw|wk)[- _]?(\d+)/i,        // Week 12, KW12, WK 12
    /w(\d+)/i,                           // W12
    /week(\d+)/i,                        // Week12
    /kw(\d+)/i                           // KW12
  ];
  
  for (const pattern of weekPatterns) {
    const weekMatch = filename.match(pattern);
    if (weekMatch && weekMatch[1]) {
      const weekNum = weekMatch[1].padStart(2, '0');
      return `WK${weekNum}`;
    }
  }
  
  return "";
}

/**
 * Get all unique weeks from the data
 * @param rawData The raw data from the Excel file
 * @param weekColIndex The index of the week column
 * @returns Set of all unique weeks
 */
export function extractWeeksFromData(rawData: any[][], weekColIndex: number): Set<string> {
  const weeks = new Set<string>();
  
  if (weekColIndex !== -1) {
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (row && row[weekColIndex]) {
        const weekValue = normalizeWeekFormat(row[weekColIndex].toString());
        if (weekValue) {
          weeks.add(weekValue);
        }
      }
    }
  }
  
  return weeks;
}

/**
 * Determine the current week from file data or filename
 * @param filename The name of the file
 * @param weeks Set of weeks extracted from data
 * @returns The current week identifier
 */
export function determineCurrentWeek(filename: string, weeks: Set<string>): string {
  // First try to extract from filename
  const weekFromFilename = extractWeekFromFilename(filename);
  if (weekFromFilename) {
    console.log(`Extracted week from filename: ${weekFromFilename}`);
    return weekFromFilename;
  }
  
  // Otherwise use the newest week from the data
  const weeksList = Array.from(weeks).sort((a, b) => {
    // Sort in descending order (newest week first)
    const numA = parseInt(a.replace(/\D/g, ''));
    const numB = parseInt(b.replace(/\D/g, ''));
    return numB - numA;
  });
  
  const currentWeek = weeksList.length > 0 ? weeksList[0] : "";
  console.log(`Using newest week from data: ${currentWeek}`);
  
  return currentWeek;
}

/**
 * Normalize week format to consistent representation
 * @param weekValue The week value to normalize
 * @returns Normalized week value in format "WKnn"
 */
export function normalizeWeekFormat(weekValue: string): string {
  if (!weekValue) return "";
  
  // Extract numeric part
  const weekNum = weekValue.replace(/\D/g, '');
  if (!weekNum) return "";
  
  // Ensure week number is padded to 2 digits
  const paddedWeekNum = weekNum.padStart(2, '0');
  return `WK${paddedWeekNum}`;
}
