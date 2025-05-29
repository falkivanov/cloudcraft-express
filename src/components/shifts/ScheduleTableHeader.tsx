
import React from "react";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { de } from "date-fns/locale";
import RequiredEmployeesCell from "./RequiredEmployeesCell";
import FinalizeDayButton from "./FinalizeDayButton";
import { 
  isWeekend, 
  findNextWorkday, 
  isSameDay, 
  isPublicHoliday,
  isWorkday
} from "@/components/shifts/utils/planning/date-utils";
import { getHolidayName, getSelectedBundesland } from "@/components/shifts/utils/planning/holidays";

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
  // Berechne den nächsten Arbeitstag
  const nextWorkday = findNextWorkday();
  const bundesland = getSelectedBundesland();
  
  // Bestimme ob es sich um eine 2-Wochen-Ansicht handelt
  const isTwoWeekView = weekDays.length > 6;
  
  // Console-Log zur Fehlersuche
  console.log('ScheduleTableHeader - Current date:', new Date().toISOString());
  console.log('ScheduleTableHeader - Next workday calculated:', nextWorkday.toISOString());
  console.log('ScheduleTableHeader - Week days displayed:', weekDays.map(d => d.toISOString()));
  console.log('ScheduleTableHeader - finalizedDays:', finalizedDays);
  
  return (
    <thead className="bg-muted sticky top-0 z-10">
      <tr>
        <th className="p-3 text-left min-w-[200px] sticky left-0 z-20 bg-muted">
          <div>Mitarbeiter</div>
        </th>
        {weekDays.map((day, index) => {
          const dateKey = formatDateKey(day);
          const scheduledCount = scheduledEmployees[dateKey] || 0;
          const requiredCount = requiredEmployees[index];
          
          // Ist dieser Tag der nächste Arbeitstag?
          const isNextWorkday = isSameDay(day, nextWorkday);
          
          // Prüfen, ob es sich um einen Feiertag handelt
          const isHoliday = isPublicHoliday(day);
          const holidayName = isHoliday ? getHolidayName(day, bundesland) : null;
          
          // Debug-Log für die Prüfung
          console.log(`Day ${format(day, "dd.MM.")} isNextWorkday:`, isNextWorkday);
          console.log(`Day ${format(day, "dd.MM.")} isHoliday:`, isHoliday, holidayName);
          
          const isFinalized = finalizedDays.includes(dateKey);
          const isWorkDay = !isWeekend(day) && !isHoliday;
          
          return (
            <th 
              key={day.toString()} 
              className={`p-3 text-center border-l ${isTwoWeekView ? 'min-w-[80px] w-20' : 'min-w-[120px]'}`}
            >
              {/* In 2-Wochen-Ansicht nur Datum, sonst Wochentag + Datum */}
              {!isTwoWeekView && (
                <div className="font-medium">
                  {format(day, "EEEE", { locale: de })}
                </div>
              )}
              <div className={`${isTwoWeekView ? 'text-xs font-bold' : 'text-sm font-normal'}`}>
                {format(day, "dd.MM.", { locale: de })}
              </div>
              
              {/* Anzeige von Feiertagen */}
              {isHoliday && holidayName && (
                <div className={`${isTwoWeekView ? 'text-[10px]' : 'text-xs'} text-red-600 font-medium mt-1 mb-1`}>
                  {isTwoWeekView ? 'Feiertag' : holidayName}
                </div>
              )}
              
              {isFinalized && (
                <div className={`${isTwoWeekView ? 'text-[10px]' : 'text-xs'} text-green-600 font-medium mt-1 mb-2`}>
                  ✓ {isTwoWeekView ? 'Final.' : 'Finalisiert'}
                </div>
              )}
              
              <RequiredEmployeesCell
                requiredCount={requiredCount}
                scheduledCount={scheduledCount}
                onRequiredChange={(value) => onRequiredChange(index, value)}
                isTwoWeekView={isTwoWeekView}
              />
              
              {/* Zeige den Finalisierungs-Button nur für den nächsten Arbeitstag an und nur wenn er noch nicht finalisiert ist */}
              {isNextWorkday && !isFinalized && isWorkDay && (
                <div className="mt-2">
                  <FinalizeDayButton
                    date={day}
                    dateKey={dateKey}
                    onFinalize={onFinalizeDay}
                    isFinalized={isFinalized}
                    isTwoWeekView={isTwoWeekView}
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
