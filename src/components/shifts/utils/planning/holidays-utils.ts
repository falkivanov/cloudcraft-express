
import { getYear } from "date-fns";

// Bundesländer in Deutschland
export type Bundesland =
  | "baden-wuerttemberg"
  | "bayern"
  | "berlin"
  | "brandenburg"
  | "bremen"
  | "hamburg"
  | "hessen"
  | "mecklenburg-vorpommern"
  | "niedersachsen"
  | "nordrhein-westfalen"
  | "rheinland-pfalz"
  | "saarland"
  | "sachsen"
  | "sachsen-anhalt"
  | "schleswig-holstein"
  | "thueringen";

// Übersetzungen für die Anzeige
export const bundeslandLabels: Record<Bundesland, string> = {
  "baden-wuerttemberg": "Baden-Württemberg",
  "bayern": "Bayern",
  "berlin": "Berlin",
  "brandenburg": "Brandenburg",
  "bremen": "Bremen",
  "hamburg": "Hamburg",
  "hessen": "Hessen",
  "mecklenburg-vorpommern": "Mecklenburg-Vorpommern",
  "niedersachsen": "Niedersachsen",
  "nordrhein-westfalen": "Nordrhein-Westfalen",
  "rheinland-pfalz": "Rheinland-Pfalz",
  "saarland": "Saarland",
  "sachsen": "Sachsen",
  "sachsen-anhalt": "Sachsen-Anhalt",
  "schleswig-holstein": "Schleswig-Holstein",
  "thueringen": "Thüringen"
};

// Interface für Feiertage
interface Holiday {
  name: string;
  date: Date;
}

// Berechnet Ostersonntag für ein gegebenes Jahr (Gaußsche Osterformel)
function getEasterSunday(year: number): Date {
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
function getFixedHolidays(year: number): Holiday[] {
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
function getMovingHolidays(year: number): Holiday[] {
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

// Filtert Feiertage nach Bundesland
function filterHolidaysByBundesland(holidays: Holiday[], bundesland: Bundesland): Holiday[] {
  return holidays.filter(holiday => {
    const name = holiday.name;
    
    // Feiertage, die in allen Bundesländern gelten
    if (["Neujahr", "Karfreitag", "Ostermontag", "Tag der Arbeit", 
         "Christi Himmelfahrt", "Pfingstmontag", "Tag der Deutschen Einheit", 
         "1. Weihnachtsfeiertag", "2. Weihnachtsfeiertag"].includes(name)) {
      return true;
    }
    
    // Heilige Drei Könige
    if (name === "Heilige Drei Könige" && ["baden-wuerttemberg", "bayern", "sachsen-anhalt"].includes(bundesland)) {
      return true;
    }
    
    // Fronleichnam
    if (name === "Fronleichnam" && ["baden-wuerttemberg", "bayern", "hessen", "nordrhein-westfalen", 
                                     "rheinland-pfalz", "saarland"].includes(bundesland)) {
      return true;
    }
    
    // Mariä Himmelfahrt
    if (name === "Mariä Himmelfahrt" && ["saarland"].includes(bundesland)) {
      return true;
    }
    
    // Reformationstag
    if (name === "Reformationstag" && ["brandenburg", "bremen", "hamburg", "mecklenburg-vorpommern", 
                                       "niedersachsen", "sachsen", "sachsen-anhalt", 
                                       "schleswig-holstein", "thueringen"].includes(bundesland)) {
      return true;
    }
    
    // Allerheiligen
    if (name === "Allerheiligen" && ["baden-wuerttemberg", "bayern", "nordrhein-westfalen", 
                                     "rheinland-pfalz", "saarland"].includes(bundesland)) {
      return true;
    }
    
    return false;
  });
}

// Prüft, ob ein Datum ein Feiertag im angegebenen Bundesland ist
export const isHoliday = (date: Date, bundesland: Bundesland): boolean => {
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
};

// Gibt den Namen des Feiertags zurück, wenn das Datum ein Feiertag ist
export const getHolidayName = (date: Date, bundesland: Bundesland): string | null => {
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
};

// Speichert das ausgewählte Bundesland im localStorage
export const saveSelectedBundesland = (bundesland: Bundesland): void => {
  localStorage.setItem('selectedBundesland', bundesland);
};

// Liest das ausgewählte Bundesland aus dem localStorage
export const getSelectedBundesland = (): Bundesland => {
  const savedBundesland = localStorage.getItem('selectedBundesland');
  return (savedBundesland as Bundesland) || 'saarland'; // Standard: Saarland
};
