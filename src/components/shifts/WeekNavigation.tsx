
import React from "react";
import { format, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface WeekNavigationProps {
  selectedWeek: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

const WeekNavigation: React.FC<WeekNavigationProps> = ({
  selectedWeek,
  onPreviousWeek,
  onNextWeek,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="icon" onClick={onPreviousWeek}>
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>
      <div className="flex items-center px-3 py-2 bg-muted rounded-md">
        <CalendarIcon className="mr-2 h-4 w-4" />
        <span>
          {format(selectedWeek, "dd.MM.yyyy", { locale: de })} - {format(addDays(selectedWeek, 5), "dd.MM.yyyy", { locale: de })}
        </span>
      </div>
      <Button variant="outline" size="icon" onClick={onNextWeek}>
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default WeekNavigation;
