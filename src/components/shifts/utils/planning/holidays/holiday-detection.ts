
import { getYear } from "date-fns";
import { Bundesland, Holiday } from "./types";
import { getFixedHolidays, getMovingHolidays } from "./calculations";
import { filterHolidaysByBundesland } from "./bundesland-filter";

// Prüft, ob ein Datum ein Feiertag im angegebenen Bundesland ist
export function isHoliday(date: Date, bundesland: Bundesland): boolean {
  const year = getYear(date);
  
  // Alle Feiertage für das Jahr holen
  const fixedHolidays = getFixedHolidays(year);
  const movingHolidays = getMovingHolidays(year);
  const allHolidays = [...fixedHolidays, ...movingHolidays];
  
  // Nach Bundesland filtern
  const relevantHolidays = filterHolidaysByBundesland(allHolidays, bundesland);
  
  // Prüfen, ob das Datum mit einem Feiertag übereinstimmt
  return relevantHolidays.some(holiday => 
    holiday.date.getDate() === date.getDate() && 
    holiday.date.getMonth() === date.getMonth() && 
    holiday.date.getFullYear() === date.getFullYear()
  );
}

// Gibt den Namen des Feiertags zurück, wenn das Datum ein Feiertag ist
export function getHolidayName(date: Date, bundesland: Bundesland): string | null {
  const year = getYear(date);
  
  // Alle Feiertage für das Jahr holen
  const fixedHolidays = getFixedHolidays(year);
  const movingHolidays = getMovingHolidays(year);
  const allHolidays = [...fixedHolidays, ...movingHolidays];
  
  // Nach Bundesland filtern
  const relevantHolidays = filterHolidaysByBundesland(allHolidays, bundesland);
  
  // Feiertag finden, der mit dem Datum übereinstimmt
  const holiday = relevantHolidays.find(holiday => 
    holiday.date.getDate() === date.getDate() && 
    holiday.date.getMonth() === date.getMonth() && 
    holiday.date.getFullYear() === date.getFullYear()
  );
  
  return holiday ? holiday.name : null;
}
