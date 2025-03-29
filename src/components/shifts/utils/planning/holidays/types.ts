
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
export interface Holiday {
  name: string;
  date: Date;
}
