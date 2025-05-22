
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Employee } from '@/types/employee';
import { STORAGE_KEYS, saveToStorage } from '@/utils/storage';
import { useEmployeeMutations } from './employee/useEmployeeMutations';
import { useEmployeeStorage } from './employee/useEmployeeStorage';

export function useEmployeeData(options?: { 
  status?: string;
  search?: string;
  skip?: number;
  limit?: number;
}) {
  const queryClient = useQueryClient();
  const [isUsingLocalStorage, setIsUsingLocalStorage] = useState<boolean>(false);
  
  const { loadLocalStorageData, syncWithBackend } = useEmployeeStorage();
  const { createEmployee, updateEmployee, deleteEmployee } = useEmployeeMutations(isUsingLocalStorage);
  
  // API-Abfrage mit React Query
  const { 
    data: apiData,
    error: apiError,
    isLoading: isApiLoading,
    isError: isApiError,
    refetch 
  } = useQuery({
    queryKey: ['employees', options],
    queryFn: async () => {
      const response = await api.employees.getAll(options);
      
      if (!response.success) {
        throw new Error(response.error || 'Fehler beim Laden der Mitarbeiter');
      }
      
      return response.data;
    },
    // Bei Fehler auf localStorage zurückfallen
    retry: false,
    meta: {
      onSettled: (data, err) => {
        if (err) {
          console.error('API-Fehler beim Laden der Mitarbeiter:', err);
          // Auf localStorage umschalten
          setIsUsingLocalStorage(true);
          toast('Verbindungsproblem', {
            description: 'Fallback auf lokale Mitarbeiterdaten aktiviert.'
          });
        }
      }
    }
  });
  
  // Cache erfolgreiche API-Antworten im localStorage
  useEffect(() => {
    if (apiData && !isUsingLocalStorage) {
      saveToStorage(STORAGE_KEYS.EMPLOYEES, apiData);
    }
  }, [apiData, isUsingLocalStorage]);
  
  // Versuche, zur API zurückzukehren, wenn die Verbindung wiederhergestellt wird
  useEffect(() => {
    if (isUsingLocalStorage) {
      const checkConnection = async () => {
        try {
          const health = await api.checkHealth();
          if (health) {
            toast.info('Verbindung wiederhergestellt', {
              description: 'Wechsle zurück zu Online-Modus.',
              action: {
                label: 'Synchronisieren',
                onClick: syncWithBackend
              }
            });
            setIsUsingLocalStorage(false);
            refetch();
          }
        } catch (error) {
          // Weiterhin offline
        }
      };
      
      // Regelmäßig Verbindung prüfen
      const interval = setInterval(checkConnection, 30000);
      return () => clearInterval(interval);
    }
  }, [isUsingLocalStorage, refetch, syncWithBackend]);
  
  // Endgültige Daten: API-Daten oder Fallback auf localStorage
  const data = isUsingLocalStorage ? loadLocalStorageData() : apiData;
  
  // Status zusammenfassen
  const isLoading = isApiLoading && !isUsingLocalStorage;
  const isError = (isApiError || !data) && isUsingLocalStorage;
  
  return {
    employees: data || [],
    isLoading,
    isError,
    isUsingLocalStorage,
    refetch,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    syncWithBackend
  };
}
