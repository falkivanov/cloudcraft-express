
import { useEffect, useState } from "react";
import { initialVehicles } from "@/data/sampleVehicleData";
import { useVehicleFilter } from "@/hooks/useVehicleFilter";
import { useVehicleOperations } from "@/hooks/useVehicleOperations";
import { Vehicle } from "@/types/vehicle";

export const useVehicleData = () => {
  const [loadedVehicles, setLoadedVehicles] = useState<Vehicle[]>([]);
  
  // Versuche Fahrzeuge aus localStorage zu laden
  useEffect(() => {
    try {
      const savedVehicles = localStorage.getItem('vehicles');
      if (savedVehicles) {
        setLoadedVehicles(JSON.parse(savedVehicles));
      }
    } catch (error) {
      console.error('Error loading vehicles from localStorage:', error);
    }
  }, []);
  
  // Verwende die geladenen Fahrzeuge oder Standarddaten, wenn keine vorhanden sind
  const {
    vehicles,
    handleUpdateVehicle,
    handleDefleetVehicle,
    handleAddVehicle,
    handleImportVehicles
  } = useVehicleOperations(loadedVehicles.length > 0 ? loadedVehicles : initialVehicles);
  
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
