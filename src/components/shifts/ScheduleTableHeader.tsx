
import React from "react";
import { format, isToday, isTomorrow } from "date-fns";
import { de } from "date-fns/locale";
import RequiredEmployeesCell from "./RequiredEmployeesCell";
import FinalizeDayButton from "./FinalizeDayButton";

interface ScheduleTableHeaderProps {
  weekDays: Date[];
  requiredEmployees: Record<number, number>;
  scheduledEmployees: Record<string, number>;
  onRequiredChange: (dayIndex: number, value: string) => void;
  formatDateKey: (date: Date) => string;
  finalizedDays: string[];
  onFinalizeDay: (dateKey: string) => void;
  nextWorkDay: Date | null;
}

const ScheduleTableHeader: React.FC<ScheduleTableHeaderProps> = ({
  weekDays,
  requiredEmployees,
  scheduledEmployees,
  onRequiredChange,
  formatDateKey,
  finalizedDays,
  onFinalizeDay,
  nextWorkDay
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
          const isTomorrowDate = isTomorrow(day);
          const isNextWorkDay = nextWorkDay ? dateKey === formatDateKey(nextWorkDay) : false;
          const showFinalizeButton = isTomorrowDate && isNextWorkDay;
          const isFinalized = finalizedDays.includes(dateKey);
          
          return (
            <th key={day.toString()} className="p-3 text-center border-l">
              <div className="font-medium">
                {format(day, "EEEE", { locale: de })}
              </div>
              <div className="text-sm font-normal">
                {format(day, "dd.MM.", { locale: de })}
              </div>
              <RequiredEmployeesCell
                requiredCount={requiredCount}
                scheduledCount={scheduledCount}
                onRequiredChange={(value) => onRequiredChange(index, value)}
              />
              
              {/* Only show finalize button for tomorrow if it's a work day */}
              {showFinalizeButton && (
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
