
import { Bundesland, Holiday } from "./types";

// Define holiday mappings to bundesländer
const HOLIDAY_BUNDESLAND_MAP: Record<string, Bundesland[]> = {
  // Holidays in all Bundesländer
  "Neujahr": ["baden-wuerttemberg", "bayern", "berlin", "brandenburg", "bremen", "hamburg", 
               "hessen", "mecklenburg-vorpommern", "niedersachsen", "nordrhein-westfalen", 
               "rheinland-pfalz", "saarland", "sachsen", "sachsen-anhalt", "schleswig-holstein", "thueringen"],
  "Karfreitag": ["baden-wuerttemberg", "bayern", "berlin", "brandenburg", "bremen", "hamburg", 
                  "hessen", "mecklenburg-vorpommern", "niedersachsen", "nordrhein-westfalen", 
                  "rheinland-pfalz", "saarland", "sachsen", "sachsen-anhalt", "schleswig-holstein", "thueringen"],
  "Ostermontag": ["baden-wuerttemberg", "bayern", "berlin", "brandenburg", "bremen", "hamburg", 
                   "hessen", "mecklenburg-vorpommern", "niedersachsen", "nordrhein-westfalen", 
                   "rheinland-pfalz", "saarland", "sachsen", "sachsen-anhalt", "schleswig-holstein", "thueringen"],
  "Tag der Arbeit": ["baden-wuerttemberg", "bayern", "berlin", "brandenburg", "bremen", "hamburg", 
                      "hessen", "mecklenburg-vorpommern", "niedersachsen", "nordrhein-westfalen", 
                      "rheinland-pfalz", "saarland", "sachsen", "sachsen-anhalt", "schleswig-holstein", "thueringen"],
  "Christi Himmelfahrt": ["baden-wuerttemberg", "bayern", "berlin", "brandenburg", "bremen", "hamburg", 
                           "hessen", "mecklenburg-vorpommern", "niedersachsen", "nordrhein-westfalen", 
                           "rheinland-pfalz", "saarland", "sachsen", "sachsen-anhalt", "schleswig-holstein", "thueringen"],
  "Pfingstmontag": ["baden-wuerttemberg", "bayern", "berlin", "brandenburg", "bremen", "hamburg", 
                     "hessen", "mecklenburg-vorpommern", "niedersachsen", "nordrhein-westfalen", 
                     "rheinland-pfalz", "saarland", "sachsen", "sachsen-anhalt", "schleswig-holstein", "thueringen"],
  "Tag der Deutschen Einheit": ["baden-wuerttemberg", "bayern", "berlin", "brandenburg", "bremen", "hamburg", 
                                 "hessen", "mecklenburg-vorpommern", "niedersachsen", "nordrhein-westfalen", 
                                 "rheinland-pfalz", "saarland", "sachsen", "sachsen-anhalt", "schleswig-holstein", "thueringen"],
  "1. Weihnachtsfeiertag": ["baden-wuerttemberg", "bayern", "berlin", "brandenburg", "bremen", "hamburg", 
                             "hessen", "mecklenburg-vorpommern", "niedersachsen", "nordrhein-westfalen", 
                             "rheinland-pfalz", "saarland", "sachsen", "sachsen-anhalt", "schleswig-holstein", "thueringen"],
  "2. Weihnachtsfeiertag": ["baden-wuerttemberg", "bayern", "berlin", "brandenburg", "bremen", "hamburg", 
                             "hessen", "mecklenburg-vorpommern", "niedersachsen", "nordrhein-westfalen", 
                             "rheinland-pfalz", "saarland", "sachsen", "sachsen-anhalt", "schleswig-holstein", "thueringen"],
  
  // Regional holidays
  "Heilige Drei Könige": ["baden-wuerttemberg", "bayern", "sachsen-anhalt"],
  "Fronleichnam": ["baden-wuerttemberg", "bayern", "hessen", "nordrhein-westfalen", "rheinland-pfalz", "saarland"],
  "Mariä Himmelfahrt": ["saarland"],
  "Reformationstag": ["brandenburg", "bremen", "hamburg", "mecklenburg-vorpommern", "niedersachsen", 
                       "sachsen", "sachsen-anhalt", "schleswig-holstein", "thueringen"],
  "Allerheiligen": ["baden-wuerttemberg", "bayern", "nordrhein-westfalen", "rheinland-pfalz", "saarland"]
};

// Filtert Feiertage nach Bundesland
export function filterHolidaysByBundesland(holidays: Holiday[], bundesland: Bundesland): Holiday[] {
  return holidays.filter(holiday => {
    const name = holiday.name;
    const validBundeslaender = HOLIDAY_BUNDESLAND_MAP[name] || [];
    
    // Prüfen, ob das Bundesland in der Liste der gültigen Bundesländer für diesen Feiertag enthalten ist
    return validBundeslaender.includes(bundesland as Bundesland);
  });
}
