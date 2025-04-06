
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
          
          if (!isNaN(weekNum) && !isNaN(year) && isDataAvailableForWeek(weekNum, year)) {
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
  
  // Add only weeks that have actual data from 2025
  // We only have week 11 data now
  const sampleWeeks = [
    { weekNum: 11, year: 2025 }  // Week 11 has data based on the project structure
  ];
  
  for (const { weekNum, year } of sampleWeeks) {
    if (isDataAvailableForWeek(weekNum, year) && 
        !weeks.some(w => w.weekNum === weekNum && w.year === year)) {
      weeks.push({
        id: `week-${weekNum}-${year}`,
        label: `KW ${weekNum}/${year}`,
        weekNum,
        year
      });
    }
  }
  
  // Sort by year and week (newest first)
  return weeks.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.weekNum - a.weekNum;
  });
};
