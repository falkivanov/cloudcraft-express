
import React from "react";
import { format, isToday, isTomorrow } from "date-fns";
import { de } from "date-fns/locale";
import RequiredEmployeesCell from "./RequiredEmployeesCell";
import FinalizeDayButton from "./FinalizeDayButton";
import { isWeekend } from "@/components/shifts/utils/planning/date-utils"; // Wir werden diese Utility-Funktion importieren

interface ScheduleTableHeaderProps {
  // ... bestehende Props
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
          const isTomorrowDate = tomorrowDate ? dateKey === formatDateKey(tomorrowDate) : false;
          const isFinalized = finalizedDays.includes(dateKey);
          
          // Fügen wir eine Prüfung für Arbeitstage hinzu
          const isWorkDay = !isWeekend(day);
          
          return (
            <th key={day.toString()} className="p-3 text-center border-l">
              <div className="font-medium">
                {format(day, "EEEE", { locale: de })}
              </div>
              <div className="text-sm font-normal">
                {format(day, "dd.MM.", { locale: de })}
              </div>
              {isFinalized && isTomorrowDate && (
                <div className="text-xs text-green-600 font-medium mt-1 mb-2">
                  ✓ Finalisiert
                </div>
              )}
              <RequiredEmployeesCell
                requiredCount={requiredCount}
                scheduledCount={scheduledCount}
                onRequiredChange={(value) => onRequiredChange(index, value)}
              />
              
              {/* Nur für morgigen Tag anzeigen und nur für Arbeitstage */}
              {isTomorrowDate && isWorkDay && (
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
