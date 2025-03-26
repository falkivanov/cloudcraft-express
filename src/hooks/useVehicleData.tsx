
import { useEffect, useState } from "react";
import { initialVehicles } from "@/data/sampleVehicleData";
import { useVehicleFilter } from "@/hooks/useVehicleFilter";
import { useVehicleOperations } from "@/hooks/useVehicleOperations";
import { Vehicle } from "@/types/vehicle";

export const useVehicleData = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Load vehicles from localStorage on component mount
  const [loadedVehicles, setLoadedVehicles] = useState<Vehicle[]>([]);
  
  useEffect(() => {
    const loadVehiclesFromStorage = () => {
      try {
        const savedVehicles = localStorage.getItem('vehicles');
        console.log('Loading vehicles from localStorage');
        
        if (savedVehicles) {
          const parsedVehicles = JSON.parse(savedVehicles);
          console.log('Found saved vehicles:', parsedVehicles.length);
          setLoadedVehicles(parsedVehicles);
        } else {
          // If no saved vehicles, use initialVehicles
          console.log('No saved vehicles found, using initial data');
          setLoadedVehicles(initialVehicles);
          // Save initial vehicles to localStorage
          localStorage.setItem('vehicles', JSON.stringify(initialVehicles));
        }
      } catch (error) {
        console.error('Error loading vehicles from localStorage:', error);
        setLoadedVehicles(initialVehicles);
      } finally {
        setIsInitialized(true);
      }
    };

    loadVehiclesFromStorage();
  }, []);
  
  // Initialize vehicle operations with loaded data
  const {
    vehicles,
    setVehicles, // We need this to sync with storage events
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
          setVehicles(updatedVehicles); // Use setVehicles from useVehicleOperations
          console.log('Updated vehicles from another tab:', updatedVehicles.length);
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
