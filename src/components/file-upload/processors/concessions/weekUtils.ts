/**
 * Utilities for handling week data in concessions files
 */

/**
 * Extract week from filename
 * @param filename The name of the file
 * @returns Extracted week identifier or empty string if not found
 */
export function extractWeekFromFilename(filename: string): string {
  const weekPattern = /(?:week|kw|wk)[- _]?(\d+)/i;
  const weekMatch = filename.match(weekPattern);
  
  if (weekMatch && weekMatch[1]) {
    return `WK${weekMatch[1]}`;
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
        weeks.add(row[weekColIndex].toString());
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
  
  if (!/^wk\d+$/i.test(weekValue)) {
    const weekNum = weekValue.replace(/\D/g, '');
    if (weekNum) {
      return `WK${weekNum}`;
    }
  }
  
  return weekValue.toUpperCase();
}
