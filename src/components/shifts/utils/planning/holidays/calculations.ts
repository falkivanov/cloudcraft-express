
import { Holiday } from "./types";

// Berechnet Ostersonntag für ein gegebenes Jahr (Gaußsche Osterformel)
export function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month, day);
}

// Berechnet alle festen Feiertage für ein Jahr
export function getFixedHolidays(year: number): Holiday[] {
  return [
    { name: "Neujahr", date: new Date(year, 0, 1) },
    { name: "Heilige Drei Könige", date: new Date(year, 0, 6) },
    { name: "Tag der Arbeit", date: new Date(year, 4, 1) },
    { name: "Mariä Himmelfahrt", date: new Date(year, 7, 15) },
    { name: "Tag der Deutschen Einheit", date: new Date(year, 9, 3) },
    { name: "Reformationstag", date: new Date(year, 9, 31) },
    { name: "Allerheiligen", date: new Date(year, 10, 1) },
    { name: "1. Weihnachtsfeiertag", date: new Date(year, 11, 25) },
    { name: "2. Weihnachtsfeiertag", date: new Date(year, 11, 26) }
  ];
}

// Berechnet alle beweglichen Feiertage basierend auf Ostern
export function getMovingHolidays(year: number): Holiday[] {
  const easterSunday = getEasterSunday(year);
  
  // Karfreitag (2 Tage vor Ostersonntag)
  const goodFriday = new Date(easterSunday);
  goodFriday.setDate(easterSunday.getDate() - 2);
  
  // Ostermontag (1 Tag nach Ostersonntag)
  const easterMonday = new Date(easterSunday);
  easterMonday.setDate(easterSunday.getDate() + 1);
  
  // Christi Himmelfahrt (39 Tage nach Ostersonntag)
  const ascensionDay = new Date(easterSunday);
  ascensionDay.setDate(easterSunday.getDate() + 39);
  
  // Pfingstmontag (50 Tage nach Ostersonntag)
  const whitMonday = new Date(easterSunday);
  whitMonday.setDate(easterSunday.getDate() + 50);
  
  // Fronleichnam (60 Tage nach Ostersonntag)
  const corpusChristi = new Date(easterSunday);
  corpusChristi.setDate(easterSunday.getDate() + 60);
  
  return [
    { name: "Karfreitag", date: goodFriday },
    { name: "Ostersonntag", date: easterSunday },
    { name: "Ostermontag", date: easterMonday },
    { name: "Christi Himmelfahrt", date: ascensionDay },
    { name: "Pfingstmontag", date: whitMonday },
    { name: "Fronleichnam", date: corpusChristi }
  ];
}
