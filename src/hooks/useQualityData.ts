
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useState } from 'react';
import { toast } from 'sonner';

export function useQualityData(timePeriod: string = 'week', location?: string) {
  const [isUsingLocalStorage, setIsUsingLocalStorage] = useState<boolean>(false);
  
  // API-Abfrage mit React Query
  const { 
    data: apiData,
    error: apiError,
    isLoading: isApiLoading,
    isError: isApiError,
    refetch 
  } = useQuery({
    queryKey: ['qualityData', timePeriod, location],
    queryFn: async () => {
      const response = await api.quality.getScorecardStats(timePeriod, location);
      
      if (!response.success) {
        throw new Error(response.error || 'Fehler beim Laden der Qualitätsdaten');
      }
      
      return response.data;
    },
    // Bei Fehler auf localStorage zurückfallen
    retry: false,
    onError: (err) => {
      console.error('API-Fehler beim Laden der Qualitätsdaten:', err);
      // Auf localStorage umschalten
      setIsUsingLocalStorage(true);
      toast.error('Verbindungsproblem', {
        description: 'Fallback auf lokale Daten aktiviert.'
      });
    }
  });
  
  // Fallback: Lade Daten aus localStorage, wenn API-Aufruf fehlschlägt
  const loadLocalStorageData = () => {
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
  
  // Daten speichern im localStorage (für Offline-Funktionalität)
  const saveToLocalStorage = (data: any) => {
    try {
      const localStorageKey = `qualityData_${timePeriod}_${location || 'all'}`;
      localStorage.setItem(localStorageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Fehler beim Speichern der Daten im localStorage:', error);
    }
  };
  
  // Cache erfolgreiche API-Antworten im localStorage
  if (apiData && !isUsingLocalStorage) {
    saveToLocalStorage(apiData);
  }
  
  // Endgültige Daten: API-Daten oder Fallback auf localStorage
  const data = isUsingLocalStorage ? loadLocalStorageData() : apiData;
  
  // Status zusammenfassen
  const isLoading = isApiLoading && !isUsingLocalStorage;
  const isError = (isApiError || !data) && isUsingLocalStorage;
  
  // Zurück zur API wechseln
  const switchBackToApi = () => {
    setIsUsingLocalStorage(false);
    refetch();
  };
  
  return {
    data,
    isLoading,
    isError,
    isUsingLocalStorage,
    switchBackToApi,
    refetch
  };
}
