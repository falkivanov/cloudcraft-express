
import { useEffect, useState } from "react";
import { initialVehicles } from "@/data/sampleVehicleData";
import { useVehicleFilter } from "@/hooks/useVehicleFilter";
import { useVehicleOperations } from "@/hooks/useVehicleOperations";
import { Vehicle } from "@/types/vehicle";

export const useVehicleData = () => {
  const [loadedVehicles, setLoadedVehicles] = useState<Vehicle[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Try to load vehicles from localStorage
  useEffect(() => {
    try {
      const savedVehicles = localStorage.getItem('vehicles');
      if (savedVehicles) {
        const parsedVehicles = JSON.parse(savedVehicles);
        setLoadedVehicles(parsedVehicles);
      } else {
        // If no saved vehicles, use initialVehicles and save them
        setLoadedVehicles(initialVehicles);
        localStorage.setItem('vehicles', JSON.stringify(initialVehicles));
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading vehicles from localStorage:', error);
      setLoadedVehicles(initialVehicles);
      setIsInitialized(true);
    }
  }, []);
  
  // Use the loaded vehicles or standard data if none are available
  const {
    vehicles,
    handleUpdateVehicle,
    handleDefleetVehicle,
    handleAddVehicle,
    handleImportVehicles
  } = useVehicleOperations(isInitialized ? loadedVehicles : []);
  
  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vehicles' && e.newValue) {
        try {
          const updatedVehicles = JSON.parse(e.newValue);
          setLoadedVehicles(updatedVehicles);
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

  // This fixes a UI issue with pointer events that was in the original code
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
