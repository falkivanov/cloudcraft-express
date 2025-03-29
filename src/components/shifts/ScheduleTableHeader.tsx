
import React from "react";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { de } from "date-fns/locale";
import RequiredEmployeesCell from "./RequiredEmployeesCell";
import FinalizeDayButton from "./FinalizeDayButton";
import { isWeekend } from "@/components/shifts/utils/planning/date-utils";

interface ScheduleTableHeaderProps {
  weekDays: Date[];
  requiredEmployees: Record<number, number>;
  scheduledEmployees: Record<string, number>;
  onRequiredChange: (dayIndex: number, value: string) => void;
  formatDateKey: (date: Date) => string;
  finalizedDays: string[];
  onFinalizeDay: (dateKey: string) => void;
  tomorrowDate: Date | null;
}

const ScheduleTableHeader: React.FC<ScheduleTableHeaderProps> = ({
  weekDays,
  requiredEmployees,
  scheduledEmployees,
  onRequiredChange,
  formatDateKey,
  finalizedDays,
  onFinalizeDay,
  tomorrowDate
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
  
  return (
    <thead className="bg-muted">
      <tr>
        <th className="p-3 text-left min-w-[200px]">
          <div>Mitarbeiter</div>
        </th>
        {weekDays.map((day, index) => {
          const dateKey = formatDateKey(day);
          const scheduledCount = scheduledEmployees[dateKey] || 0;
          const requiredCount = requiredEmployees[index];
          
          // Ist dieser Tag der nächste Arbeitstag?
          const isNextWorkday = day.getDate() === nextWorkday.getDate() && 
                              day.getMonth() === nextWorkday.getMonth() && 
                              day.getFullYear() === nextWorkday.getFullYear();
          
          const isFinalized = finalizedDays.includes(dateKey);
          const isWorkDay = !isWeekend(day);
          
          return (
            <th key={day.toString()} className="p-3 text-center border-l">
              <div className="font-medium">
                {format(day, "EEEE", { locale: de })}
              </div>
              <div className="text-sm font-normal">
                {format(day, "dd.MM.", { locale: de })}
              </div>
              {isFinalized && isNextWorkday && (
                <div className="text-xs text-green-600 font-medium mt-1 mb-2">
                  ✓ Finalisiert
                </div>
              )}
              <RequiredEmployeesCell
                requiredCount={requiredCount}
                scheduledCount={scheduledCount}
                onRequiredChange={(value) => onRequiredChange(index, value)}
              />
              
              {/* Nur für den nächsten Arbeitstag anzeigen */}
              {isNextWorkday && isWorkDay && (
                <div className="mt-2">
                  <FinalizeDayButton
                    date={day}
                    dateKey={dateKey}
                    onFinalize={onFinalizeDay}
                    isFinalized={isFinalized}
                  />
                </div>
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
};

export default ScheduleTableHeader;
