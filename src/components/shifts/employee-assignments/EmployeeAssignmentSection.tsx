
import React from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Employee } from "@/types/employee";
import { Wave } from "../types/wave-types";

interface EmployeeAssignmentSectionProps {
  scheduledEmployees: Employee[];
  waves: Wave[];
  onEmployeeWaveChange: (employeeId: string, waveId: number) => void;
  getEmployeeWaveId: (employeeId: string) => number;
}

const EmployeeAssignmentSection: React.FC<EmployeeAssignmentSectionProps> = ({
  scheduledEmployees,
  waves,
  onEmployeeWaveChange,
  getEmployeeWaveId,
}) => {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Mitarbeiter den Wellen zuordnen</h3>
      <div className="space-y-2">
        {scheduledEmployees.map((employee) => {
          const waveId = getEmployeeWaveId(employee.id);
          
          return (
            <div key={employee.id} className="flex justify-between items-center p-2 border rounded-md">
              <div>
                <span className="font-medium">{employee.name}</span>
              </div>
              <Select 
                value={waveId.toString()} 
                onValueChange={(value) => onEmployeeWaveChange(employee.id, parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Welle auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {waves.map((wave) => (
                    <SelectItem key={wave.id} value={wave.id.toString()}>
                      Welle {wave.id} - {wave.time} Uhr
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmployeeAssignmentSection;
