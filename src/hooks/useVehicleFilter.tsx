
import { useState, useMemo } from "react";
import { Vehicle } from "@/types/vehicle";

type SortField = "licensePlate" | "brand" | "model" | "vinNumber" | "infleetDate";
type SortDirection = "asc" | "desc";

export const useVehicleFilter = (vehicles: Vehicle[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [sortField, setSortField] = useState<SortField>("licensePlate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Filter nach Aktiven und Defleeten Fahrzeugen
  const activeVehicles = useMemo(() => 
    vehicles.filter(vehicle => vehicle.status !== "Defleet"),
    [vehicles]
  );

  const defleetedVehicles = useMemo(() => 
    vehicles.filter(vehicle => vehicle.status === "Defleet"),
    [vehicles]
  );

  // Apply filters and sorting
  const applyFiltersAndSort = (vehicleList: Vehicle[]) => {
    // First apply search filter
    let filtered = vehicleList.filter((vehicle) =>
      vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.vinNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Then sort
    filtered.sort((a, b) => {
      if (sortField === "licensePlate") {
        return sortDirection === "asc" 
          ? a.licensePlate.localeCompare(b.licensePlate)
          : b.licensePlate.localeCompare(a.licensePlate);
      } else if (sortField === "brand") {
        return sortDirection === "asc" 
          ? a.brand.localeCompare(b.brand)
          : b.brand.localeCompare(a.brand);
      } else if (sortField === "model") {
        return sortDirection === "asc" 
          ? a.model.localeCompare(b.model)
          : b.model.localeCompare(a.model);
      } else if (sortField === "vinNumber") {
        return sortDirection === "asc" 
          ? a.vinNumber.localeCompare(b.vinNumber)
          : b.vinNumber.localeCompare(a.vinNumber);
      } else if (sortField === "infleetDate") {
        const dateA = new Date(a.infleetDate).getTime();
        const dateB = new Date(b.infleetDate).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
    
    return filtered;
  };

  // Apply filters and sorting to active and defleet vehicles
  const filteredActiveVehicles = useMemo(() => 
    applyFiltersAndSort(activeVehicles),
    [activeVehicles, searchQuery, sortField, sortDirection]
  );

  const filteredDefleetedVehicles = useMemo(() => 
    applyFiltersAndSort(defleetedVehicles),
    [defleetedVehicles, searchQuery, sortField, sortDirection]
  );

  // Toggle sort direction or set a new sort field
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredActiveVehicles,
    filteredDefleetedVehicles,
    sortField,
    sortDirection,
    handleSort
  };
};
