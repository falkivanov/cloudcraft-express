
import { api } from '@/services/api';
import { toast } from 'sonner';
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '@/utils/storage';
import { Employee } from '@/types/employee';

export function useEmployeeStorage() {
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
      
      // Pendenz-Liste löschen
      saveToStorage('pendingEmployeeChanges', []);
      
      toast.success('Synchronisierung abgeschlossen');
    }
  };

  return {
    loadLocalStorageData,
    syncWithBackend,
    saveToStorage
  };
}
