
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Employee } from '@/types/employee';
import { STORAGE_KEYS, saveToStorage } from '@/utils/storage';
import { useEmployeeMutations } from './employee/useEmployeeMutations';
import { useEmployeeStorage } from './employee/useEmployeeStorage';
import { useOfflineCapableFetch } from './common/useOfflineCapableFetch';

export function useEmployeeData(options?: { 
  status?: string;
  search?: string;
  skip?: number;
  limit?: number;
}) {
  const queryClient = useQueryClient();
  const { loadLocalStorageData, syncWithBackend } = useEmployeeStorage();
  const { createEmployee, updateEmployee, deleteEmployee } = useEmployeeMutations(false); // Will be updated below
  
  const result = useOfflineCapableFetch<Employee[]>({
    queryKey: ['employees', options],
    queryFn: async () => {
      const response = await api.employees.getAll(options);
      
      if (!response.success) {
        throw new Error(response.error || 'Fehler beim Laden der Mitarbeiter');
      }
      
      return response.data;
    },
    loadLocalData: loadLocalStorageData,
    saveLocalData: (data) => saveToStorage(STORAGE_KEYS.EMPLOYEES, data),
    onSwitchToOffline: () => {
      // Trigger sync when connection is restored
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
            result.switchBackToApi();
          }
        } catch (error) {
          // Weiterhin offline
        }
      };
      
      // Regelmäßig Verbindung prüfen
      const interval = setInterval(checkConnection, 30000);
      return () => clearInterval(interval);
    }
  });

  // Override the mutation functions with those that respect the offline status
  const employeeMutations = useEmployeeMutations(result.isUsingLocalStorage);
  
  return {
    employees: result.data || [],
    isLoading: result.isLoading,
    isError: result.isError,
    isUsingLocalStorage: result.isUsingLocalStorage,
    refetch: result.refetch,
    createEmployee: employeeMutations.createEmployee,
    updateEmployee: employeeMutations.updateEmployee, 
    deleteEmployee: employeeMutations.deleteEmployee,
    syncWithBackend
  };
}
