
import { Bundesland, Holiday } from "./types";

// Filtert Feiertage nach Bundesland
export function filterHolidaysByBundesland(holidays: Holiday[], bundesland: Bundesland): Holiday[] {
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
