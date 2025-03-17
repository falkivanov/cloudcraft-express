
import React from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import RequiredEmployeesCell from "./RequiredEmployeesCell";

interface ScheduleTableHeaderProps {
  weekDays: Date[];
  requiredEmployees: Record<number, number>;
  scheduledEmployees: Record<string, number>;
  onRequiredChange: (dayIndex: number, value: string) => void;
  formatDateKey: (date: Date) => string;
}

const ScheduleTableHeader: React.FC<ScheduleTableHeaderProps> = ({
  weekDays,
  requiredEmployees,
  scheduledEmployees,
  onRequiredChange,
  formatDateKey
}) => {
  return (
    <thead className="bg-muted">
      <tr>
        <th className="p-3 text-left min-w-[200px]">
          <div>Mitarbeiter</div>
          <div className="mt-2 text-xs flex justify-between items-center">
            <span>Forecast:</span>
            <span className="text-xs ml-2">Geplant:</span>
          </div>
        </th>
        {weekDays.map((day, index) => {
          const dateKey = formatDateKey(day);
          const scheduledCount = scheduledEmployees[dateKey] || 0;
          const requiredCount = requiredEmployees[index];
          
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
            </th>
          );
        })}
      </tr>
    </thead>
  );
};

export default ScheduleTableHeader;
