
import { useMemo } from "react";
import { Employee } from "@/types/employee";
import { useEmployeeStorage } from "./useEmployeeStorage";
import { useEmployeeStorageSync } from "./useEmployeeStorageSync";
import { filterAndProcessEmployees } from "../utils/employee-processor";

export const useEmployeeLoader = (initialEmployeesData: Employee[] = []) => {
  // Load and manage employees
  const { employees, setEmployees } = useEmployeeStorage(initialEmployeesData);
  
  // Sync employees across tabs and handle beforeunload
  useEmployeeStorageSync(employees, setEmployees);
  
  // Derived state for filtered employees
  const filteredEmployees = useMemo(() => 
    filterAndProcessEmployees(employees),
    [employees]
  );

  return {
    employees,
    filteredEmployees
  };
};
