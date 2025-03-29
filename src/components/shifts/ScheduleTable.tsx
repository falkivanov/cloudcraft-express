
import React from "react";
import ScheduleTableHeader from "./ScheduleTableHeader";
import EmployeeRow from "./EmployeeRow";
import { Employee } from "@/types/employee";
import { isTomorrow, format, addDays, isWeekend } from "date-fns";

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
  // Finde den nächsten Arbeitstag (nicht am Wochenende)
  const findNextWorkday = () => {
    const today = new Date();
    let nextDay = addDays(today, 1); // Beginne mit morgen
    
    // Wenn der nächste Tag ein Wochenende ist, überspringe zum Montag
    if (isWeekend(nextDay)) {
      // Montag finden (wenn heute Samstag ist, dann +2, wenn heute Sonntag ist, dann +1)
      const daysUntilMonday = nextDay.getDay() === 0 ? 1 : 2; // 0 = Sonntag
      nextDay = addDays(today, daysUntilMonday);
    }
    
    return nextDay;
  };
  
  // Berechne den nächsten Arbeitstag
  const nextWorkday = findNextWorkday();
  
  // Finde den Index dieses Tages in unserer Woche
  const nextWorkdayIndex = weekDays.findIndex(day => 
    day.getDate() === nextWorkday.getDate() && 
    day.getMonth() === nextWorkday.getMonth() && 
    day.getFullYear() === nextWorkday.getFullYear()
  );
  
  // Für Debug-Zwecke loggen wir alle relevanten Daten
  console.log('Next workday:', nextWorkday ? format(nextWorkday, 'yyyy-MM-dd') : 'None found');
  console.log('Next workday index in weekDays:', nextWorkdayIndex);
  console.log('All weekDays:', weekDays.map(d => format(d, 'yyyy-MM-dd')));
  console.log('Today is:', format(new Date(), 'yyyy-MM-dd'));

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
          tomorrowDate={nextWorkdayIndex !== -1 ? weekDays[nextWorkdayIndex] : null}
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
