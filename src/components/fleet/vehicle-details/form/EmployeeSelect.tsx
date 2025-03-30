
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STORAGE_KEYS, loadFromStorage } from "@/utils/storageUtils";
import { Employee } from "@/types/employee";
import { initialEmployees } from "@/data/sampleEmployeeData";

interface EmployeeSelectProps {
  employeeId?: string;
  onEmployeeSelect: (employeeId: string) => void;
}

const EmployeeSelect = ({ employeeId, onEmployeeSelect }: EmployeeSelectProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  // Lade die Mitarbeiterdaten aus dem localStorage
  useEffect(() => {
    const loadEmployees = () => {
      try {
        const savedEmployees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES);
        if (savedEmployees && Array.isArray(savedEmployees) && savedEmployees.length > 0) {
          console.log("EmployeeSelect loaded employees:", savedEmployees.length);
          setEmployees(savedEmployees);
        } else {
          console.log("EmployeeSelect using sample employees");
          setEmployees(initialEmployees);
        }
      } catch (error) {
        console.error("Error loading employees for select:", error);
        setEmployees(initialEmployees);
      }
    };
    
    loadEmployees();
  }, []);
  
  return (
    <div className="space-y-2">
      <Label htmlFor="caused-by-employee">Verursacht durch</Label>
      <Select 
        value={employeeId}
        onValueChange={onEmployeeSelect}
      >
        <SelectTrigger>
          <SelectValue placeholder="Mitarbeiter auswählen" />
        </SelectTrigger>
        <SelectContent>
          {employees.map(employee => (
            <SelectItem key={employee.id} value={employee.id}>
              {employee.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Export the list of employees so it can be used in other components
export const getEmployees = () => {
  const savedEmployees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES);
  return savedEmployees && savedEmployees.length > 0 ? savedEmployees : initialEmployees;
};

export default EmployeeSelect;
