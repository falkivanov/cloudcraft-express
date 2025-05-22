import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Employee } from '@/types/employee';
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '@/utils/storage';

export function useEmployeeData(options?: { 
  status?: string;
  search?: string;
  skip?: number;
  limit?: number;
}) {
  const queryClient = useQueryClient();
  const [isUsingLocalStorage, setIsUsingLocalStorage] = useState<boolean>(false);
  
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
      onError: (err: Error) => {
        console.error('API-Fehler beim Laden der Mitarbeiter:', err);
        // Auf localStorage umschalten
        setIsUsingLocalStorage(true);
        toast('Verbindungsproblem', {
          description: 'Fallback auf lokale Mitarbeiterdaten aktiviert.'
        });
      }
    }
  });
  
  // Mutation zum Erstellen eines neuen Mitarbeiters
  const createEmployeeMutation = useMutation({
    mutationFn: async (employee: Employee) => {
      if (isUsingLocalStorage) {
        // Im localStorage speichern, wenn offline
        const employees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES) || [];
        const newEmployee = { ...employee, id: crypto.randomUUID() };
        employees.push(newEmployee);
        saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);
        
        // Mitarbeiter für spätere Synchronisation markieren
        const pendingChanges = loadFromStorage<{type: string, data: any}[]>('pendingEmployeeChanges') || [];
        pendingChanges.push({ type: 'create', data: newEmployee });
        saveToStorage('pendingEmployeeChanges', pendingChanges);
        
        return newEmployee;
      } else {
        // Via API erstellen
        const response = await api.employees.create(employee);
        if (!response.success) {
          throw new Error(response.error || 'Fehler beim Erstellen des Mitarbeiters');
        }
        return response.data;
      }
    },
    onSuccess: () => {
      // Invalidiere den Cache, um aktualisierte Daten zu laden
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast('Mitarbeiter erstellt');
    },
    onError: (error) => {
      toast('Fehler beim Erstellen des Mitarbeiters', {
        description: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    }
  });
  
  // Mutation zum Aktualisieren eines Mitarbeiters
  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, employee }: { id: string, employee: Employee }) => {
      if (isUsingLocalStorage) {
        // Im localStorage aktualisieren, wenn offline
        const employees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES) || [];
        const updatedEmployees = employees.map(emp => 
          emp.id === id ? { ...emp, ...employee, id } : emp
        );
        saveToStorage(STORAGE_KEYS.EMPLOYEES, updatedEmployees);
        
        // Änderung für spätere Synchronisation markieren
        const pendingChanges = loadFromStorage<{type: string, data: any}[]>('pendingEmployeeChanges') || [];
        pendingChanges.push({ type: 'update', data: { id, ...employee } });
        saveToStorage('pendingEmployeeChanges', pendingChanges);
        
        return { id, ...employee };
      } else {
        // Via API aktualisieren
        const response = await api.employees.update(id, employee);
        if (!response.success) {
          throw new Error(response.error || 'Fehler beim Aktualisieren des Mitarbeiters');
        }
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast('Mitarbeiter aktualisiert');
    },
    onError: (error) => {
      toast('Fehler beim Aktualisieren des Mitarbeiters', {
        description: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    }
  });
  
  // Mutation zum Löschen eines Mitarbeiters
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isUsingLocalStorage) {
        // Aus localStorage löschen, wenn offline
        const employees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES) || [];
        const filteredEmployees = employees.filter(emp => emp.id !== id);
        saveToStorage(STORAGE_KEYS.EMPLOYEES, filteredEmployees);
        
        // Löschung für spätere Synchronisation markieren
        const pendingChanges = loadFromStorage<{type: string, data: any}[]>('pendingEmployeeChanges') || [];
        pendingChanges.push({ type: 'delete', data: { id } });
        saveToStorage('pendingEmployeeChanges', pendingChanges);
        
        return { id };
      } else {
        // Via API löschen
        const response = await api.employees.delete(id);
        if (!response.success) {
          throw new Error(response.error || 'Fehler beim Löschen des Mitarbeiters');
        }
        return { id };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast('Mitarbeiter gelöscht');
    },
    onError: (error) => {
      toast('Fehler beim Löschen des Mitarbeiters', {
        description: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    }
  });
  
  // Laden von Daten aus localStorage
  const loadLocalStorageData = (): Employee[] => {
    try {
      return loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES) || [];
    } catch (error) {
      console.error('Fehler beim Laden der Mitarbeiter aus localStorage:', error);
      return [];
    }
  };
  
  // Synchronisieren von localStorage-Daten mit dem Backend
  const syncWithBackend = async () => {
    const pendingChanges = loadFromStorage<{type: string, data: any}[]>('pendingEmployeeChanges') || [];
    
    if (pendingChanges.length > 0) {
      toast.info(`Synchronisiere ${pendingChanges.length} ausstehende Änderungen...`);
      
      for (const change of pendingChanges) {
        try {
          if (change.type === 'create') {
            await api.employees.create(change.data);
          } else if (change.type === 'update') {
            const { id, ...employee } = change.data;
            await api.employees.update(id, employee);
          } else if (change.type === 'delete') {
            await api.employees.delete(change.data.id);
          }
        } catch (error) {
          console.error(`Fehler beim Synchronisieren von ${change.type}:`, error);
          // Weiter mit nächster Änderung
        }
      }
      
      // Pendenz-Liste löschen und Daten neu laden
      saveToStorage('pendingEmployeeChanges', []);
      setIsUsingLocalStorage(false);
      await refetch();
      
      toast.success('Synchronisierung abgeschlossen');
    }
  };
  
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
  }, [isUsingLocalStorage, refetch]);
  
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
    createEmployee: createEmployeeMutation.mutate,
    updateEmployee: updateEmployeeMutation.mutate,
    deleteEmployee: deleteEmployeeMutation.mutate,
    syncWithBackend
  };
}
