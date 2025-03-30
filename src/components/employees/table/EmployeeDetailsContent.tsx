
import React from "react";
import { Employee } from "@/types/employee";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import PersonalInfoSection from "./detail-components/PersonalInfoSection";
import WorkPreferencesSection from "./detail-components/WorkPreferencesSection";

interface EmployeeDetailsContentProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onClose: () => void;
}

const EmployeeDetailsContent: React.FC<EmployeeDetailsContentProps> = ({
  employee,
  onEdit,
  onClose
}) => {
  // Array of day abbreviations (Monday to Saturday)
  const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const isFullTimeEmployee = employee.workingDaysAWeek >= 5;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{employee.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        <PersonalInfoSection employee={employee} />
        <WorkPreferencesSection 
          employee={employee} 
          weekDays={weekDays} 
          isFullTimeEmployee={isFullTimeEmployee}
        />
        
        <div className="col-span-1 md:col-span-2 pt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onEdit(employee)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Bearbeiten
          </Button>
          <Button onClick={onClose}>Schließen</Button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailsContent;
