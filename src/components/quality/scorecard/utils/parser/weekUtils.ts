
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
  const weekMatch = filename.match(/KW[_\s]*(\d+)/i);
  return weekMatch && weekMatch[1] ? parseInt(weekMatch[1], 10) : new Date().getWeek();
};
