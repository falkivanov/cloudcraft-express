
import React from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import ShiftCell from "./ShiftCell";
import { Employee } from "@/types/employee";

interface EmployeeRowProps {
  employee: Employee;
  weekDays: Date[];
  formatDateKey: (date: Date) => string;
  onFlexibilityOverride: (employee: Employee) => void;
  isTemporarilyFlexible: (employeeId: string) => boolean;
}

const EmployeeRow: React.FC<EmployeeRowProps> = ({
  employee,
  weekDays,
  formatDateKey,
  onFlexibilityOverride,
  isTemporarilyFlexible
}) => {
  return (
    <tr className="border-t">
      <td className="p-3 font-medium">
        {employee.name}
        <div className="text-xs text-muted-foreground">
          {employee.preferredWorkingDays.join(', ')}
          {!employee.isWorkingDaysFlexible && (
            <span 
              className="ml-1 text-red-500 font-medium cursor-pointer hover:underline"
              onClick={() => onFlexibilityOverride(employee)}
              title="Klicken, um Flexibilität für diese Woche zu aktivieren"
            >
              {isTemporarilyFlexible(employee.id) 
                ? "(temporär flexibel)" 
                : "(nicht flexibel)"}
            </span>
          )}
        </div>
      </td>
      {weekDays.map((day) => (
        <td key={day.toString()} className="border-l p-0 h-14">
          <ShiftCell 
            employeeId={employee.id} 
            date={formatDateKey(day)}
            preferredDays={employee.preferredWorkingDays}
            dayOfWeek={format(day, "EEEEEE", { locale: de })}
            isFlexible={employee.isWorkingDaysFlexible || isTemporarilyFlexible(employee.id)}
          />
        </td>
      ))}
    </tr>
  );
};

export default EmployeeRow;
