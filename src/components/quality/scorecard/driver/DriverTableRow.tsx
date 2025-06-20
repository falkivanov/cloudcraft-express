
import React, { useEffect, useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { DriverKPI } from "../types";
import MetricCell from "./MetricCell";
import { loadFromStorage, STORAGE_KEYS } from "@/utils/storage";
import { Employee } from "@/types/employee";

interface DriverTableRowProps {
  driver: DriverKPI;
  availableMetrics: string[]; // Liste der verfügbaren Metriken in korrekter Reihenfolge
}

const DriverTableRow: React.FC<DriverTableRowProps> = ({ driver, availableMetrics }) => {
  const [displayName, setDisplayName] = useState<string>(driver.name);
  
  // Load employee data on component mount
  useEffect(() => {
    const loadEmployeeData = () => {
      const employees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES);
      if (!employees) return;
      
      // Try to find a matching employee by transporterId
      const matchingEmployee = employees.find(
        emp => emp.transporterId === driver.name
      );
      
      if (matchingEmployee) {
        setDisplayName(matchingEmployee.name);
      }
    };
    
    loadEmployeeData();
    
    // Listen for employee data changes
    const handleEmployeesUpdated = () => {
      loadEmployeeData();
    };
    
    window.addEventListener('employees-updated', handleEmployeesUpdated);
    
    return () => {
      window.removeEventListener('employees-updated', handleEmployeesUpdated);
    };
  }, [driver.name]);
  
  return (
    <TableRow className="border-b border-gray-100 hover:bg-gray-50">
      <TableCell className="py-2 px-3 text-sm font-medium">{displayName}</TableCell>
      
      {availableMetrics.map((metricName) => {
        // Finde die entsprechende Metrik für diese Spalte
        const metric = driver.metrics.find(m => m.name === metricName);
        
        return (
          <MetricCell 
            key={metricName} 
            metricName={metricName}
            value={metric?.value ?? 0}
            unit={metric?.unit || ""}
          />
        );
      })}
    </TableRow>
  );
};

export default DriverTableRow;
