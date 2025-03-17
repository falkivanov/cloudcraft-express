
import React from "react";
import ScheduleTableHeader from "./ScheduleTableHeader";
import EmployeeRow from "./EmployeeRow";
import { Employee } from "@/types/employee";
import NextDaySchedule from "./NextDaySchedule";

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
  // Find the next day that has scheduled employees
  const nextWorkDayIndex = weekDays.findIndex(day => {
    const dateKey = formatDateKey(day);
    return (scheduledEmployees[dateKey] || 0) > 0;
  });
  
  const nextWorkDay = nextWorkDayIndex !== -1 ? weekDays[nextWorkDayIndex] : null;
  
  // Find the next day that has been finalized (to show the schedule for)
  const nextDayIndex = weekDays.findIndex(day => 
    finalizedDays.includes(formatDateKey(day))
  );
  
  const nextDay = nextDayIndex !== -1 ? weekDays[nextDayIndex] : null;
  const nextDayKey = nextDay ? formatDateKey(nextDay) : '';
  const scheduledForNextDay = nextDay ? getScheduledEmployeesForDay(nextDayKey) : [];

  return (
    <div className="space-y-4">
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
            nextWorkDay={nextWorkDay}
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
      
      {showNextDaySchedule && nextDay && (
        <NextDaySchedule
          scheduledEmployees={scheduledForNextDay}
          date={nextDay}
          onClose={() => setShowNextDaySchedule(false)}
        />
      )}
    </div>
  );
};

export default ScheduleTable;
