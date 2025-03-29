
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
  // Kopie des Datums erstellen, um das Original nicht zu verändern
  const baseCopy = new Date(baseDate);
  
  // Starte mit dem morgigen Tag
  const tomorrow = new Date(baseCopy);
  tomorrow.setDate(baseCopy.getDate() + 1);
  
  // Debug log
  console.log('findNextWorkday - baseDate:', baseCopy);
  console.log('findNextWorkday - tomorrow:', tomorrow);
  console.log('findNextWorkday - tomorrow is weekend?', isWeekend(tomorrow));
  
  // Wenn morgen ein Werktag ist, gib morgen zurück
  if (!isWeekend(tomorrow)) {
    console.log('findNextWorkday - returning tomorrow');
    return tomorrow;
  }
  
  // Wenn morgen ein Wochenende ist, berechne den nächsten Montag
  const nextMonday = new Date(baseCopy);
  
  // Wenn heute Freitag (5) ist, dann +3 Tage bis Montag
  // Wenn heute Samstag (6) ist, dann +2 Tage bis Montag
  // Wenn heute Sonntag (0) ist, dann +1 Tag bis Montag
  let daysUntilMonday;
  const dayOfWeek = baseCopy.getDay();
  
  if (dayOfWeek === 5) { // Freitag
    daysUntilMonday = 3;
  } else if (dayOfWeek === 6) { // Samstag
    daysUntilMonday = 2;
  } else if (dayOfWeek === 0) { // Sonntag
    daysUntilMonday = 1;
  } else {
    // Für alle anderen Tage, wenn morgen Wochenende ist (muss Freitag sein)
    daysUntilMonday = 3;
  }
  
  nextMonday.setDate(baseCopy.getDate() + daysUntilMonday);
  
  console.log('findNextWorkday - current day of week:', dayOfWeek);
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
