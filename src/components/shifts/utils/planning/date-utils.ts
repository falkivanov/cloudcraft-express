
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
  
  // Debug log
  console.log('findNextWorkday - baseDate:', baseDate);
  console.log('findNextWorkday - tomorrow:', tomorrow);
  console.log('findNextWorkday - tomorrow is weekend?', isWeekend(tomorrow));
  
  // Wenn morgen ein Werktag ist, gib morgen zurück
  if (!isWeekend(tomorrow)) {
    console.log('findNextWorkday - returning tomorrow');
    return tomorrow;
  }
  
  // Sonst finde den nächsten Montag
  const nextMonday = new Date(baseDate);
  const daysUntilMonday = (tomorrow.getDay() === 0) ? 1 : 2; // Wenn morgen Sonntag ist, dann +1, sonst +2
  nextMonday.setDate(baseDate.getDate() + daysUntilMonday);
  
  console.log('findNextWorkday - days until Monday:', daysUntilMonday);
  console.log('findNextWorkday - returning nextMonday:', nextMonday);
  
  return nextMonday;
};

// Hilfsfunktion zum Vergleichen von Datumswerten
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};
