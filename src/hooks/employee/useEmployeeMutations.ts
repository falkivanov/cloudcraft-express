
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Employee } from '@/types/employee';
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '@/utils/storage';

export function useEmployeeMutations(isUsingLocalStorage: boolean) {
  const queryClient = useQueryClient();

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

  return {
    createEmployee: createEmployeeMutation.mutate,
    updateEmployee: updateEmployeeMutation.mutate,
    deleteEmployee: deleteEmployeeMutation.mutate
  };
}
