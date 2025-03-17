
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
import { Users } from "lucide-react";

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
      <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
        <Users className="h-4 w-4" />
        Mitarbeiter manuell den Wellen zuordnen
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        Hier können Sie Mitarbeiter individuell zuordnen, unabhängig von den oben festgelegten Vorgaben.
      </p>
      <div className="space-y-2">
        {scheduledEmployees.map((employee) => {
          const waveId = getEmployeeWaveId(employee.id);
          const wave = waves.find(w => w.id === waveId);
          
          return (
            <div key={employee.id} className="flex justify-between items-center p-2 border rounded-md hover:bg-muted/30">
              <div>
                <span className="font-medium">{employee.name}</span>
              </div>
              <Select 
                value={waveId.toString()} 
                onValueChange={(value) => onEmployeeWaveChange(employee.id, parseInt(value))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Welle auswählen">
                    {wave ? `Welle ${wave.id} (${wave.time} Uhr)` : "Wählen..."}
                  </SelectValue>
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
