
// Extend Date prototype to get the week number
declare global {
  interface Date {
    getWeek(): number;
  }
}

// Add method to get ISO week number
Date.prototype.getWeek = function(): number {
  // Create a new date object for the Thursday in this week
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

export {};
