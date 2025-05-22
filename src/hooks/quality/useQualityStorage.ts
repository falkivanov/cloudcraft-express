
export function useQualityStorage() {
  // Daten speichern im localStorage (für Offline-Funktionalität)
  const saveToLocalStorage = (data: any, timePeriod: string, location?: string) => {
    try {
      const localStorageKey = `qualityData_${timePeriod}_${location || 'all'}`;
      localStorage.setItem(localStorageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Fehler beim Speichern der Daten im localStorage:', error);
    }
  };
  
  // Fallback: Lade Daten aus localStorage
  const loadFromLocalStorage = (timePeriod: string, location?: string) => {
    try {
      const localStorageKey = `qualityData_${timePeriod}_${location || 'all'}`;
      const storedData = localStorage.getItem(localStorageKey);
      
      if (storedData) {
        return JSON.parse(storedData);
      }
      
      // Fallback auf Standard-Schlüssel
      const defaultData = localStorage.getItem('qualityData');
      if (defaultData) {
        return JSON.parse(defaultData);
      }
      
      return null;
    } catch (error) {
      console.error('Fehler beim Laden der Daten aus localStorage:', error);
      return null;
    }
  };

  return {
    saveToLocalStorage,
    loadFromLocalStorage
  };
}
