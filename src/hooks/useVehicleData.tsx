
import { useEffect, useState } from "react";
import { initialVehicles } from "@/data/sampleVehicleData";
import { useVehicleFilter } from "@/hooks/useVehicleFilter";
import { useVehicleOperations } from "@/hooks/useVehicleOperations";
import { Vehicle } from "@/types/vehicle";

export const useVehicleData = () => {
  const [initialData, setInitialData] = useState<Vehicle[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Load vehicles from localStorage on component mount
  useEffect(() => {
    const loadVehiclesFromStorage = () => {
      try {
        const savedVehicles = localStorage.getItem('vehicles');
        console.log('Loading vehicles from localStorage');
        
        if (savedVehicles) {
          const parsedVehicles = JSON.parse(savedVehicles);
          console.log('Found saved vehicles:', parsedVehicles.length);
          setInitialData(parsedVehicles);
        } else {
          // If no saved vehicles, use initialVehicles
          console.log('No saved vehicles found, using initial data');
          setInitialData(initialVehicles);
          // Save initial vehicles to localStorage
          localStorage.setItem('vehicles', JSON.stringify(initialVehicles));
        }
      } catch (error) {
        console.error('Error loading vehicles from localStorage:', error);
        setInitialData(initialVehicles);
      } finally {
        setIsInitialized(true);
      }
    };

    loadVehiclesFromStorage();
  }, []);
  
  // Initialize vehicle operations with data from localStorage
  const {
    vehicles,
    handleUpdateVehicle,
    handleDefleetVehicle, 
    handleAddVehicle,
    handleImportVehicles
  } = useVehicleOperations(isInitialized ? initialData : []);
  
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
          setInitialData(updatedVehicles);
        } catch (error) {
          console.error('Error parsing vehicles from storage event:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Fix for UI pointer events issue
  useEffect(() => {
    const handleMouseMove = () => {
      document.body.style.pointerEvents = 'auto';
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

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
