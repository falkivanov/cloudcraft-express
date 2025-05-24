
import React from "react";
import { format, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface WeekNavigationProps {
  selectedWeek: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  viewMode: '1week' | '2weeks';
  onViewModeChange: (mode: '1week' | '2weeks') => void;
}

const WeekNavigation: React.FC<WeekNavigationProps> = ({
  selectedWeek,
  onPreviousWeek,
  onNextWeek,
  viewMode,
  onViewModeChange,
}) => {
  const endDate = viewMode === '1week' 
    ? addDays(selectedWeek, 5) 
    : addDays(selectedWeek, 11);

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={onPreviousWeek}>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <div className="flex items-center px-3 py-2 bg-muted rounded-md">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>
            {format(selectedWeek, "dd.MM.yyyy", { locale: de })} - {format(endDate, "dd.MM.yyyy", { locale: de })}
          </span>
        </div>
        <Button variant="outline" size="icon" onClick={onNextWeek}>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center border rounded-lg">
        <Button
          variant={viewMode === '1week' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('1week')}
          className="rounded-r-none"
        >
          1 Woche
        </Button>
        <Button
          variant={viewMode === '2weeks' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('2weeks')}
          className="rounded-l-none"
        >
          2 Wochen
        </Button>
      </div>
    </div>
  );
};

export default WeekNavigation;
