import { format } from "date-fns";
import { de } from "date-fns/locale";

// Returns day of week abbreviation (Mo, Di, etc.)
export const getDayAbbreviation = (date: Date): string => {
  return format(date, "EEEEEE", { locale: de });
};

// Wochenend-Prüfung hinzufügen
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sonntag, 6 = Samstag
};
