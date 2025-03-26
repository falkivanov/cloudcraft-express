
import { useState, useEffect, useCallback } from "react";
import { Vehicle } from "@/types/vehicle";
import { useToast } from "@/hooks/use-toast";

export const useVehicleOperations = (initialVehicleData: Vehicle[] = []) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicleData);
  const { toast } = useToast();

  // Update internal state when initialVehicleData changes
  useEffect(() => {
    if (initialVehicleData.length > 0) {
      console.log('Updating vehicles state from initialData:', initialVehicleData.length);
      setVehicles(initialVehicleData);
    }
  }, [initialVehicleData]);

  // Save vehicles to localStorage whenever they change
  useEffect(() => {
    if (vehicles.length > 0) {
      try {
        localStorage.setItem('vehicles', JSON.stringify(vehicles));
        console.log('Saved vehicles to localStorage:', vehicles.length);
      } catch (error) {
        console.error('Error saving vehicles to localStorage:', error);
      }
    }
  }, [vehicles]);

  // Update a vehicle
  const handleUpdateVehicle = useCallback((updatedVehicle: Vehicle) => {
    setVehicles(prevVehicles => prevVehicles.map(vehicle => 
      vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle
    ));
    
    const previousStatus = vehicles.find(v => v.id === updatedVehicle.id)?.status;
    if (updatedVehicle.status !== "Defleet" && previousStatus === "Defleet") {
      toast({
        title: "Fahrzeug reaktiviert",
        description: `Das Fahrzeug ${updatedVehicle.licensePlate} wurde reaktiviert.`,
      });
    }
  }, [vehicles, toast]);

  // Defleet a vehicle
  const handleDefleetVehicle = useCallback((vehicle: Vehicle, defleetDate: string) => {
    const updatedVehicle = {
      ...vehicle,
      status: "Defleet" as const,
      defleetDate: defleetDate
    };
    
    setVehicles(prevVehicles => prevVehicles.map(v => 
      v.id === vehicle.id ? updatedVehicle : v
    ));
    
    toast({
      title: "Fahrzeug defleeted",
      description: `Das Fahrzeug ${vehicle.licensePlate} wurde defleeted.`,
    });
  }, [toast]);

  // Add a new vehicle
  const handleAddVehicle = useCallback((vehicleData: Omit<Vehicle, "id">) => {
    setVehicles(prevVehicles => {
      const newId = (Math.max(...prevVehicles.map(v => parseInt(v.id)), 0) + 1).toString();
      
      const newVehicle: Vehicle = {
        id: newId,
        ...vehicleData
      };
      
      const updatedVehicles = [...prevVehicles, newVehicle];
      
      toast({
        title: "Fahrzeug hinzugefügt",
        description: `Das Fahrzeug ${newVehicle.licensePlate} wurde erfolgreich hinzugefügt.`,
      });
      
      return updatedVehicles;
    });
  }, [toast]);

  // Import multiple vehicles
  const handleImportVehicles = useCallback((importedVehicles: Vehicle[]) => {
    setVehicles(prevVehicles => {
      const lastId = prevVehicles.length > 0 
        ? Math.max(...prevVehicles.map(v => parseInt(v.id))) 
        : 0;
      
      const vehiclesWithIds = importedVehicles.map((vehicle, index) => ({
        ...vehicle,
        id: (lastId + index + 1).toString()
      }));
      
      const combinedVehicles = [...prevVehicles, ...vehiclesWithIds];
      
      // Explicitly save to localStorage after import (in addition to the effect)
      try {
        localStorage.setItem('vehicles', JSON.stringify(combinedVehicles));
        console.log('Saved imported vehicles to localStorage:', combinedVehicles.length);
      } catch (error) {
        console.error('Error saving imported vehicles to localStorage:', error);
      }
      
      return combinedVehicles;
    });
  }, []);

  return {
    vehicles,
    setVehicles, // Export setVehicles for direct updates
    handleUpdateVehicle,
    handleDefleetVehicle,
    handleAddVehicle,
    handleImportVehicles
  };
};
