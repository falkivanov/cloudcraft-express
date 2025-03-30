
/**
 * Add method to get week number from Date
 */
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function(): number {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

/**
 * Extract week number from filename
 * @param filename The PDF filename
 * @returns The extracted week number or current week
 */
export const extractWeekFromFilename = (filename: string): number => {
  // First try the "Week" pattern (e.g. "DE-MASC-DSU1-Week11-DSP-Scorecard-3.0.pdf")
  const weekMatch = filename.match(/Week(\d+)/i);
  if (weekMatch && weekMatch[1]) {
    return parseInt(weekMatch[1], 10);
  }
  
  // Then try the "KW" pattern (e.g. "Scorecard_KW12.pdf")
  const kwMatch = filename.match(/KW[_\s]*(\d+)/i);
  if (kwMatch && kwMatch[1]) {
    return parseInt(kwMatch[1], 10);
  }
  
  // If no pattern matches, return current week
  return new Date().getWeek();
};
