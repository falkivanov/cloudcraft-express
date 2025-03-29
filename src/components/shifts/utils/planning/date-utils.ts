
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { isHoliday, getSelectedBundesland } from "./holidays-utils";

// Returns day of week abbreviation (Mo, Di, etc.)
export const getDayAbbreviation = (date: Date): string => {
  return format(date, "EEEEEE", { locale: de });
};

// Wochenend-Prüfung
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sonntag, 6 = Samstag
};

// Feiertagsprüfung basierend auf dem ausgewählten Bundesland
export const isPublicHoliday = (date: Date): boolean => {
  const bundesland = getSelectedBundesland();
  return isHoliday(date, bundesland);
};

// Prüft, ob ein Tag ein Arbeitstag ist (kein Wochenende und kein Feiertag)
export const isWorkday = (date: Date): boolean => {
  return !isWeekend(date) && !isPublicHoliday(date);
};

// Findet den nächsten Arbeitstag (nicht am Wochenende und kein Feiertag)
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
  console.log('findNextWorkday - tomorrow is holiday?', isPublicHoliday(tomorrow));
  
  // Wenn morgen ein Werktag ist (kein Wochenende und kein Feiertag), gib morgen zurück
  if (isWorkday(tomorrow)) {
    console.log('findNextWorkday - returning tomorrow');
    return tomorrow;
  }
  
  // Wenn morgen kein Werktag ist, suche den nächsten Werktag
  let nextWorkday = new Date(tomorrow);
  
  // Erhöhe das Datum, bis ein Werktag gefunden wird
  let maxIterations = 10; // Sicherheitsbegrenzung
  while (!isWorkday(nextWorkday) && maxIterations > 0) {
    nextWorkday.setDate(nextWorkday.getDate() + 1);
    maxIterations--;
  }
  
  console.log('findNextWorkday - found next workday:', nextWorkday);
  return nextWorkday;
};

// Hilfsfunktion zum Vergleichen von Datumswerten
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};
