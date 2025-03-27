
import { useEffect, useState } from "react";
import { initialVehicles } from "@/data/sampleVehicleData";
import { useVehicleFilter } from "@/hooks/useVehicleFilter";
import { useVehicleOperations } from "@/hooks/useVehicleOperations";
import { Vehicle } from "@/types/vehicle";

export const useVehicleData = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Load vehicles from localStorage on component mount
  const [loadedVehicles, setLoadedVehicles] = useState<Vehicle[]>(initialVehicles);
  
  useEffect(() => {
    const loadVehiclesFromStorage = () => {
      try {
        const savedVehicles = localStorage.getItem('vehicles');
        console.log('Loading vehicles from localStorage');
        
        if (savedVehicles) {
          const parsedVehicles = JSON.parse(savedVehicles);
          if (parsedVehicles && Array.isArray(parsedVehicles) && parsedVehicles.length > 0) {
            console.log('Found saved vehicles:', parsedVehicles.length);
            setLoadedVehicles(parsedVehicles);
            return; // Erfolgreich geladen
          }
        }
        
        // Wenn keine gültigen gespeicherten Daten vorhanden sind oder Parsing fehlschlägt
        console.log('No valid vehicles found in localStorage, using initial data');
        setLoadedVehicles(initialVehicles);
        
        // Initialdaten im localStorage speichern
        localStorage.setItem('vehicles', JSON.stringify(initialVehicles));
      } catch (error) {
        console.error('Error loading vehicles from localStorage:', error);
        setLoadedVehicles(initialVehicles);
        // Bei Fehler auch die Initialdaten speichern
        localStorage.setItem('vehicles', JSON.stringify(initialVehicles));
      } finally {
        setIsInitialized(true);
      }
    };

    loadVehiclesFromStorage();
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
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vehicles' && e.newValue) {
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
