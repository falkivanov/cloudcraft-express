
import React from "react";
import ScheduleTableHeader from "./ScheduleTableHeader";
import EmployeeRow from "./EmployeeRow";
import { Employee } from "@/types/employee";
import { isTomorrow, format } from "date-fns";

interface ScheduleTableProps {
  weekDays: Date[];
  filteredEmployees: Employee[];
  requiredEmployees: Record<number, number>;
  scheduledEmployees: Record<string, number>;
  handleRequiredChange: (dayIndex: number, value: string) => void;
  formatDateKey: (date: Date) => string;
  onFlexibilityOverride: (employee: Employee) => void;
  isTemporarilyFlexible: (employeeId: string) => boolean;
  finalizedDays: string[];
  onFinalizeDay: (dateKey: string) => void;
  showNextDaySchedule: boolean;
  getScheduledEmployeesForDay: (date: string) => Employee[];
  setShowNextDaySchedule: (show: boolean) => void;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({
  weekDays,
  filteredEmployees,
  requiredEmployees,
  scheduledEmployees,
  handleRequiredChange,
  formatDateKey,
  onFlexibilityOverride,
  isTemporarilyFlexible,
  finalizedDays,
  onFinalizeDay,
  showNextDaySchedule,
  getScheduledEmployeesForDay,
  setShowNextDaySchedule
}) => {
  // Einfach den morgen Tag finden (ohne Überprüfung auf scheduled employees)
  const tomorrowIndex = weekDays.findIndex(day => isTomorrow(day));
  const tomorrow = tomorrowIndex !== -1 ? weekDays[tomorrowIndex] : null;
  
  // Für Debug-Zwecke loggen wir alle relevanten Daten
  console.log('Tomorrow date:', tomorrow ? format(tomorrow, 'yyyy-MM-dd') : 'None found');
  console.log('All weekDays:', weekDays.map(d => format(d, 'yyyy-MM-dd')));
  console.log('Today is:', format(new Date(), 'yyyy-MM-dd'));
  console.log('Is tomorrow check:', weekDays.map(d => ({ date: format(d, 'yyyy-MM-dd'), isTomorrow: isTomorrow(d) })));

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full border-collapse">
        <ScheduleTableHeader 
          weekDays={weekDays}
          requiredEmployees={requiredEmployees}
          scheduledEmployees={scheduledEmployees}
          onRequiredChange={handleRequiredChange}
          formatDateKey={formatDateKey}
          finalizedDays={finalizedDays}
          onFinalizeDay={onFinalizeDay}
          tomorrowDate={tomorrow}
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
