
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
  const filteredActiveEmployees = useMemo(() => 
    activeEmployees.filter((employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.transporterId.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [activeEmployees, searchQuery]
  );

  const filteredFormerEmployees = useMemo(() => 
    formerEmployees.filter((employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.transporterId.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [formerEmployees, searchQuery]
  );

  return {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredActiveEmployees,
    filteredFormerEmployees
  };
};
