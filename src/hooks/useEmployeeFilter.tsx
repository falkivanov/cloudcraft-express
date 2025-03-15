
import { useState, useMemo } from "react";
import { Employee } from "@/types/employee";

export const useEmployeeFilter = (employees: Employee[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  // Filter nach Aktiven und Ehemaligen Mitarbeitern
  const activeEmployees = useMemo(() => 
    employees.filter(employee => employee.endDate === null),
    [employees]
  );

  const formerEmployees = useMemo(() => 
    employees.filter(employee => employee.endDate !== null),
    [employees]
  );

  // Filter nach Suchbegriff
  const filteredActiveEmployees = useMemo(() => {
    const filtered = activeEmployees.filter((employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.transporterId.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Ensure filteredActiveEmployees is never empty to maintain table structure
    return filtered;
  }, [activeEmployees, searchQuery]);

  const filteredFormerEmployees = useMemo(() => {
    const filtered = formerEmployees.filter((employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.transporterId.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Ensure filteredFormerEmployees is never empty to maintain table structure
    return filtered;
  }, [formerEmployees, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredActiveEmployees,
    filteredFormerEmployees
  };
};
