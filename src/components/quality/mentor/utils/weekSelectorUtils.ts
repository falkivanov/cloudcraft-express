
import { loadFromStorage } from "@/utils/storage";

export interface AvailableWeek {
  id: string;
  label: string;
  weekNum: number;
  year: number;
}

/**
 * Extract week information from a localStorage key
 */
export function parseWeekKey(key: string): { weekNum: number; year: number } | null {
  const match = key.match(/mentor_data_week_(\d+)_(\d+)/);
  if (match) {
    return {
      weekNum: parseInt(match[1], 10),
      year: parseInt(match[2], 10),
    };
  }
  return null;
}

/**
 * Create a week identifier from week number and year
 */
export function createWeekId(weekNum: number, year: number): string {
  return `week-${weekNum}-${year}`;
}

/**
 * Sort weeks by year and week number (newest first)
 */
export function sortWeeks(weeks: AvailableWeek[]): AvailableWeek[] {
  return weeks.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.weekNum - a.weekNum;
  });
}

/**
 * Check if a week exists in the available weeks array
 */
export function weekExists(weeks: AvailableWeek[], weekId: string): boolean {
  return weeks.some(w => w.id === weekId);
}

/**
 * Get the "no data available" week placeholder
 */
export function getNoDataWeek(): AvailableWeek {
  return {
    id: "week-0-0",
    label: "Keine Daten vorhanden",
    weekNum: 0,
    year: 0
  };
}
