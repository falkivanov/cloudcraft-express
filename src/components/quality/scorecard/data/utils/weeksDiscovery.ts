
import { isDataAvailableForWeek } from "./weekIdentifier";

/**
 * Gets all available weeks with scorecard data from localStorage
 * @returns Array of available weeks with their data
 */
export const getAllAvailableWeeks = (): {id: string; label: string; weekNum: number; year: number}[] => {
  const weeks: {id: string; label: string; weekNum: number; year: number}[] = [];
  
  // Iterate through all localStorage keys to find week-specific data
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('scorecard_data_week_')) {
      try {
        // Parse the week and year from the key
        const match = key.match(/scorecard_data_week_(\d+)_(\d+)/);
        if (match) {
          const weekNum = parseInt(match[1], 10);
          const year = parseInt(match[2], 10);
          
          if (!isNaN(weekNum) && !isNaN(year)) {
            weeks.push({
              id: `week-${weekNum}-${year}`,
              label: `KW ${weekNum}/${year}`,
              weekNum,
              year
            });
          }
        }
      } catch (e) {
        console.error(`Error parsing week data for key ${key}:`, e);
      }
    }
  }
  
  // Add sample weeks from 2025
  for (let weekNum = 6; weekNum <= 11; weekNum++) {
    if (isDataAvailableForWeek(weekNum, 2025) && 
        !weeks.some(w => w.weekNum === weekNum && w.year === 2025)) {
      weeks.push({
        id: `week-${weekNum}-2025`,
        label: `KW ${weekNum}/2025 (Beispiel)`,
        weekNum,
        year: 2025
      });
    }
  }
  
  // Sort by year and week (newest first)
  return weeks.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.weekNum - a.weekNum;
  });
};
