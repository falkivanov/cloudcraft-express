
import { format } from "date-fns";
import { de } from "date-fns/locale";

// Returns day of week abbreviation (Mo, Di, etc.)
export const getDayAbbreviation = (date: Date): string => {
  return format(date, "EEEEEE", { locale: de });
};

// Wochenend-Prüfung
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sonntag, 6 = Samstag
};

// Prüft, ob ein Tag ein Arbeitstag ist (kein Wochenende)
export const isWorkday = (date: Date): boolean => {
  return !isWeekend(date);
};

// Findet den nächsten Arbeitstag (nicht am Wochenende)
export const findNextWorkday = (baseDate: Date = new Date()): Date => {
  // Starte mit dem morgigen Tag
  const tomorrow = new Date(baseDate);
  tomorrow.setDate(baseDate.getDate() + 1);
  
  // Wenn morgen ein Werktag ist, gib morgen zurück
  if (!isWeekend(tomorrow)) {
    return tomorrow;
  }
  
  // Sonst finde den nächsten Montag
  const nextMonday = new Date(baseDate);
  const daysUntilMonday = tomorrow.getDay() === 0 ? 1 : 2; // Wenn morgen Sonntag ist, dann +1, sonst +2
  nextMonday.setDate(baseDate.getDate() + daysUntilMonday);
  
  return nextMonday;
};
