
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Dummy-Daten für Mitarbeiter - In einer realen Anwendung würden diese aus einer API kommen
const employees = [
  { id: "1", name: "Max Mustermann" },
  { id: "2", name: "Anna Schmidt" },
  { id: "3", name: "Thomas Müller" },
  { id: "4", name: "Lisa Weber" },
  { id: "5", name: "Michael Fischer" },
];

interface EmployeeSelectProps {
  employeeId?: string;
  onEmployeeSelect: (employeeId: string) => void;
}

const EmployeeSelect = ({ employeeId, onEmployeeSelect }: EmployeeSelectProps) => {
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

export { employees };
export default EmployeeSelect;
