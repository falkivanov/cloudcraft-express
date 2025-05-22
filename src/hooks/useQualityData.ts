
import { api } from '@/services/api';
import { useState } from 'react';
import { useQualityStorage } from './quality/useQualityStorage';
import { useOfflineCapableFetch } from './common/useOfflineCapableFetch';

export function useQualityData(timePeriod: string = 'week', location?: string) {
  const { saveToLocalStorage, loadFromLocalStorage } = useQualityStorage();
  
  const result = useOfflineCapableFetch({
    queryKey: ['qualityData', timePeriod, location],
    queryFn: async () => {
      const response = await api.quality.getScorecardStats(timePeriod, location);
      
      if (!response.success) {
        throw new Error(response.error || 'Fehler beim Laden der Qualitätsdaten');
      }
      
      return response.data;
    },
    loadLocalData: () => loadFromLocalStorage(timePeriod, location),
    saveLocalData: (data) => saveToLocalStorage(data, timePeriod, location),
  });
  
  return result;
}
