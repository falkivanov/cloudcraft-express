
import React from "react";
import ScheduleTableHeader from "./ScheduleTableHeader";
import EmployeeRow from "./EmployeeRow";
import { Employee } from "@/types/employee";

interface ScheduleTableProps {
  weekDays: Date[];
  filteredEmployees: Employee[];
  requiredEmployees: Record<number, number>;
  scheduledEmployees: Record<string, number>;
  handleRequiredChange: (dayIndex: number, value: string) => void;
  formatDateKey: (date: Date) => string;
  onFlexibilityOverride: (employee: Employee) => void;
  isTemporarilyFlexible: (employeeId: string) => boolean;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({
  weekDays,
  filteredEmployees,
  requiredEmployees,
  scheduledEmployees,
  handleRequiredChange,
  formatDateKey,
  onFlexibilityOverride,
  isTemporarilyFlexible
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full border-collapse">
        <ScheduleTableHeader 
          weekDays={weekDays}
          requiredEmployees={requiredEmployees}
          scheduledEmployees={scheduledEmployees}
          onRequiredChange={handleRequiredChange}
          formatDateKey={formatDateKey}
        />
        <tbody>
          {filteredEmployees.map((employee) => (
            <EmployeeRow
              key={employee.id}
              employee={employee}
              weekDays={weekDays}
              formatDateKey={formatDateKey}
              onFlexibilityOverride={onFlexibilityOverride}
              isTemporarilyFlexible={isTemporarilyFlexible}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTable;
