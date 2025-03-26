
import { useState, useEffect } from "react";
import { Vehicle } from "@/types/vehicle";
import { useToast } from "@/hooks/use-toast";

export const useVehicleOperations = (initialVehicleData: Vehicle[] = []) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicleData);
  const { toast } = useToast();

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
  const handleUpdateVehicle = (updatedVehicle: Vehicle) => {
    setVehicles(vehicles.map(vehicle => 
      vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle
    ));
    
    if (updatedVehicle.status !== "Defleet" && vehicles.find(v => v.id === updatedVehicle.id)?.status === "Defleet") {
      toast({
        title: "Fahrzeug reaktiviert",
        description: `Das Fahrzeug ${updatedVehicle.licensePlate} wurde reaktiviert.`,
      });
    }
  };

  // Defleet a vehicle
  const handleDefleetVehicle = (vehicle: Vehicle, defleetDate: string) => {
    const updatedVehicle = {
      ...vehicle,
      status: "Defleet" as const,
      defleetDate: defleetDate
    };
    
    setVehicles(vehicles.map(v => 
      v.id === vehicle.id ? updatedVehicle : v
    ));
    
    toast({
      title: "Fahrzeug defleeted",
      description: `Das Fahrzeug ${vehicle.licensePlate} wurde defleeted.`,
    });
  };

  // Add a new vehicle
  const handleAddVehicle = (vehicleData: Omit<Vehicle, "id">) => {
    const newId = (Math.max(...vehicles.map(v => parseInt(v.id)), 0) + 1).toString();
    
    const newVehicle: Vehicle = {
      id: newId,
      ...vehicleData
    };
    
    setVehicles([...vehicles, newVehicle]);
    
    toast({
      title: "Fahrzeug hinzugefügt",
      description: `Das Fahrzeug ${newVehicle.licensePlate} wurde erfolgreich hinzugefügt.`,
    });
  };

  // Import multiple vehicles
  const handleImportVehicles = (importedVehicles: Vehicle[]) => {
    const lastId = vehicles.length > 0 
      ? Math.max(...vehicles.map(v => parseInt(v.id))) 
      : 0;
    
    const vehiclesWithIds = importedVehicles.map((vehicle, index) => ({
      ...vehicle,
      id: (lastId + index + 1).toString()
    }));
    
    const combinedVehicles = [...vehicles, ...vehiclesWithIds];
    setVehicles(combinedVehicles);
    
    // Explicitly save to localStorage after import
    try {
      localStorage.setItem('vehicles', JSON.stringify(combinedVehicles));
      console.log('Saved imported vehicles to localStorage:', combinedVehicles.length);
    } catch (error) {
      console.error('Error saving imported vehicles to localStorage:', error);
    }
  };

  return {
    vehicles,
    handleUpdateVehicle,
    handleDefleetVehicle,
    handleAddVehicle,
    handleImportVehicles
  };
};
