
import { Bundesland } from "./types";

// Speichert das ausgewählte Bundesland im localStorage
export function saveSelectedBundesland(bundesland: Bundesland): void {
  localStorage.setItem('selectedBundesland', bundesland);
}

// Liest das ausgewählte Bundesland aus dem localStorage
export function getSelectedBundesland(): Bundesland {
  const savedBundesland = localStorage.getItem('selectedBundesland');
  return (savedBundesland as Bundesland) || 'saarland'; // Standard: Saarland
}
