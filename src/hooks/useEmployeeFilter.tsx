
import { useState, useMemo } from "react";
import { Employee } from "@/types/employee";

type SortField = "name" | "startDate" | "workingDaysAWeek" | "preferredVehicle";
type SortDirection = "asc" | "desc";

export const useEmployeeFilter = (employees: Employee[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [workingDaysFilter, setWorkingDaysFilter] = useState<number | null>(null);
  const [vehicleFilter, setVehicleFilter] = useState<string>("");

  // Get unique vehicles for filtering
  const uniqueVehicles = useMemo(() => {
    const vehicles = new Set<string>();
    employees.forEach(employee => {
      if (employee.preferredVehicle && employee.preferredVehicle.trim() !== "") {
        vehicles.add(employee.preferredVehicle);
      }
    });
    return Array.from(vehicles).sort();
  }, [employees]);

  // Filter nach Aktiven und Ehemaligen Mitarbeitern
  const activeEmployees = useMemo(() => 
    employees.filter(employee => employee.endDate === null),
    [employees]
  );

  const formerEmployees = useMemo(() => 
    employees.filter(employee => employee.endDate !== null),
    [employees]
  );

  // Apply filters and sorting
  const applyFiltersAndSort = (employeeList: Employee[]) => {
    // First apply search filter
    let filtered = employeeList.filter((employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.transporterId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Then apply working days filter if set
    if (workingDaysFilter !== null) {
      filtered = filtered.filter(employee => 
        employee.workingDaysAWeek === workingDaysFilter
      );
    }

    // Then apply vehicle filter if set
    if (vehicleFilter && vehicleFilter.trim() !== "") {
      filtered = filtered.filter(employee => 
        employee.preferredVehicle === vehicleFilter
      );
    }

    // Then sort
    filtered.sort((a, b) => {
      if (sortField === "name") {
        return sortDirection === "asc" 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortField === "startDate") {
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortField === "workingDaysAWeek") {
        return sortDirection === "asc" 
          ? a.workingDaysAWeek - b.workingDaysAWeek 
          : b.workingDaysAWeek - a.workingDaysAWeek;
      } else if (sortField === "preferredVehicle") {
        return sortDirection === "asc" 
          ? a.preferredVehicle.localeCompare(b.preferredVehicle)
          : b.preferredVehicle.localeCompare(a.preferredVehicle);
      }
      return 0;
    });
    
    return filtered;
  };

  // Apply filters and sorting to active and former employees
  const filteredActiveEmployees = useMemo(() => 
    applyFiltersAndSort(activeEmployees),
    [activeEmployees, searchQuery, sortField, sortDirection, workingDaysFilter, vehicleFilter]
  );

  const filteredFormerEmployees = useMemo(() => 
    applyFiltersAndSort(formerEmployees),
    [formerEmployees, searchQuery, sortField, sortDirection, workingDaysFilter, vehicleFilter]
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
    filteredActiveEmployees,
    filteredFormerEmployees,
    sortField,
    sortDirection,
    handleSort,
    workingDaysFilter,
    setWorkingDaysFilter,
    vehicleFilter,
    setVehicleFilter,
    uniqueVehicles
  };
};
