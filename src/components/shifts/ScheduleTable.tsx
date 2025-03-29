
import React from "react";
import ScheduleTableHeader from "./ScheduleTableHeader";
import EmployeeRow from "./EmployeeRow";
import { Employee } from "@/types/employee";
import { 
  findNextWorkday, 
  isPublicHoliday
} from "@/components/shifts/utils/planning/date-utils";
import { getHolidayName, getSelectedBundesland } from "@/components/shifts/utils/planning/holidays-utils";

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
  // Berechne den nächsten Arbeitstag
  const nextWorkday = findNextWorkday();
  const bundesland = getSelectedBundesland();
  
  // Prüfe auf Feiertage in der angezeigten Woche
  const holidaysInWeek = weekDays
    .filter(day => isPublicHoliday(day))
    .map(day => ({
      date: day,
      name: getHolidayName(day, bundesland)
    }));
  
  // Debug-Information
  console.log('ScheduleTable - Next workday:', nextWorkday.toISOString());
  console.log('ScheduleTable - Week days:', weekDays.map(d => d.toISOString()));
  console.log('ScheduleTable - Finalized days:', finalizedDays);
  console.log('ScheduleTable - Holidays in week:', holidaysInWeek);
  
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
          tomorrowDate={nextWorkday}
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
