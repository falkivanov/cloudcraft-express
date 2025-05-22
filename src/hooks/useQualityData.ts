
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useQualityStorage } from './quality/useQualityStorage';

export function useQualityData(timePeriod: string = 'week', location?: string) {
  const [isUsingLocalStorage, setIsUsingLocalStorage] = useState<boolean>(false);
  const { saveToLocalStorage, loadFromLocalStorage } = useQualityStorage();
  
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
    meta: {
      onSettled: (data, err) => {
        if (err) {
          console.error('API-Fehler beim Laden der Qualitätsdaten:', err);
          // Auf localStorage umschalten
          setIsUsingLocalStorage(true);
          toast('Verbindungsproblem', {
            description: 'Fallback auf lokale Daten aktiviert.'
          });
        }
      }
    }
  });
  
  // Cache erfolgreiche API-Antworten im localStorage
  useEffect(() => {
    if (apiData && !isUsingLocalStorage) {
      saveToLocalStorage(apiData, timePeriod, location);
    }
  }, [apiData, isUsingLocalStorage, timePeriod, location, saveToLocalStorage]);
  
  // Endgültige Daten: API-Daten oder Fallback auf localStorage
  const data = isUsingLocalStorage 
    ? loadFromLocalStorage(timePeriod, location) 
    : apiData;
  
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
