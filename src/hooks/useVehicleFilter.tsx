
import { useState, useMemo } from "react";
import { Vehicle } from "@/types/vehicle";

export const useVehicleFilter = (vehicles: Vehicle[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  // Filter nach Aktiven und Defleeten Fahrzeugen
  const activeVehicles = useMemo(() => 
    vehicles.filter(vehicle => vehicle.status !== "Defleet"),
    [vehicles]
  );

  const defleetedVehicles = useMemo(() => 
    vehicles.filter(vehicle => vehicle.status === "Defleet"),
    [vehicles]
  );

  // Filter nach Suchbegriff
  const filteredActiveVehicles = useMemo(() => 
    activeVehicles.filter((vehicle) =>
      vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.vinNumber.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [activeVehicles, searchQuery]
  );

  const filteredDefleetedVehicles = useMemo(() => 
    defleetedVehicles.filter((vehicle) =>
      vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.vinNumber.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [defleetedVehicles, searchQuery]
  );

  return {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredActiveVehicles,
    filteredDefleetedVehicles
  };
};
