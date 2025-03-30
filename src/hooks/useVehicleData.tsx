
import { useEffect, useState } from "react";
import { initialVehicles } from "@/data/sampleVehicleData";
import { useVehicleFilter } from "@/hooks/useVehicleFilter";
import { useVehicleOperations } from "@/hooks/useVehicleOperations";
import { Vehicle } from "@/types/vehicle";
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from "@/utils/storageUtils";
import { toast } from "sonner";

export const useVehicleData = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Load vehicles from localStorage on component mount
  const [loadedVehicles, setLoadedVehicles] = useState<Vehicle[]>(initialVehicles);
  
  useEffect(() => {
    const loadVehiclesFromStorage = () => {
      try {
        const savedVehicles = loadFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES);
        
        if (savedVehicles && Array.isArray(savedVehicles) && savedVehicles.length > 0) {
          console.log('Found saved vehicles:', savedVehicles.length);
          setLoadedVehicles(savedVehicles);
          
          // Nach erfolgreichem Laden, einen neuen Zeitstempel setzen
          saveToStorage(STORAGE_KEYS.DATA_TIMESTAMP, Date.now().toString());
          
          // Benachrichtigung über geladene Daten
          toast.success(`${savedVehicles.length} Fahrzeuge geladen`);
          return; // Erfolgreich geladen
        }
        
        // Wenn keine gültigen gespeicherten Daten vorhanden sind oder Parsing fehlschlägt
        console.log('No valid vehicles found in localStorage, using initial data');
        setLoadedVehicles(initialVehicles);
        
        // Initialdaten im localStorage speichern
        saveToStorage(STORAGE_KEYS.VEHICLES, initialVehicles);
        saveToStorage(STORAGE_KEYS.DATA_TIMESTAMP, Date.now().toString());
        
        // Benachrichtigung über Beispieldaten
        toast.info("Beispieldaten für Fahrzeuge geladen", {
          description: "Es wurden keine gespeicherten Daten gefunden."
        });
      } catch (error) {
        console.error('Error loading vehicles from localStorage:', error);
        setLoadedVehicles(initialVehicles);
        
        // Bei Fehler auch die Initialdaten speichern
        try {
          saveToStorage(STORAGE_KEYS.VEHICLES, initialVehicles);
          saveToStorage(STORAGE_KEYS.DATA_TIMESTAMP, Date.now().toString());
          
          toast.warning("Fehler beim Laden der Fahrzeugdaten", {
            description: "Beispieldaten wurden geladen."
          });
        } catch (storageError) {
          console.error('Error saving fallback vehicle data:', storageError);
          toast.error("Probleme mit dem Speicherzugriff", {
            description: "Daten können nicht gespeichert werden."
          });
        }
      } finally {
        setIsInitialized(true);
      }
    };

    loadVehiclesFromStorage();
    
    // Füge einen Event-Listener für das beforeunload-Event hinzu, um die Daten zu sichern
    const handleBeforeUnload = () => {
      try {
        // Setze einen Zeitstempel für die Datenüberprüfung
        saveToStorage(STORAGE_KEYS.DATA_TIMESTAMP, Date.now().toString());
        
        // Stelle sicher, dass die Fahrzeugdaten gespeichert sind
        if (vehicles.length > 0) {
          saveToStorage(STORAGE_KEYS.VEHICLES, vehicles);
        }
      } catch (error) {
        console.error('Error saving vehicles to localStorage before unload:', error);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  // Initialize vehicle operations with loaded data
  const {
    vehicles,
    setVehicles,
    handleUpdateVehicle,
    handleDefleetVehicle, 
    handleAddVehicle,
    handleImportVehicles
  } = useVehicleOperations(loadedVehicles);
  
  // Filter and sort the vehicles
  const {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredActiveVehicles,
    filteredDefleetedVehicles,
    sortField,
    sortDirection,
    handleSort,
    statusFilter,
    setStatusFilter
  } = useVehicleFilter(vehicles);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | Event) => {
      // Wenn es ein StorageEvent ist, überprüfe den Key
      if (e instanceof StorageEvent) {
        if (e.key === STORAGE_KEYS.VEHICLES && e.newValue) {
          console.log('Vehicle data changed in another tab');
          try {
            const updatedVehicles = JSON.parse(e.newValue);
            if (updatedVehicles && Array.isArray(updatedVehicles) && updatedVehicles.length > 0) {
              setVehicles(updatedVehicles);
              console.log('Updated vehicles from another tab:', updatedVehicles.length);
            }
          } catch (error) {
            console.error('Error parsing vehicles from storage event:', error);
          }
        }
      } else {
        // Wenn es ein generisches Event ist (für innerhalb des gleichen Tabs)
        try {
          const savedVehicles = loadFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES);
          if (savedVehicles && Array.isArray(savedVehicles) && savedVehicles.length > 0) {
            setVehicles(savedVehicles);
          }
        } catch (error) {
          console.error('Error handling internal storage event:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [setVehicles]);

  // Debug check
  useEffect(() => {
    console.log('useVehicleData current vehicles count:', vehicles.length);
  }, [vehicles]);

  return {
    vehicles,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredActiveVehicles,
    filteredDefleetedVehicles,
    handleUpdateVehicle,
    handleDefleetVehicle,
    handleAddVehicle,
    handleImportVehicles,
    sortField,
    sortDirection,
    handleSort,
    statusFilter,
    setStatusFilter
  };
};
