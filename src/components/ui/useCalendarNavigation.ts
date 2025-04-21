
import * as React from "react";

export const YEARS = Array.from({ length: 31 }, (_, i) => 2015 + i);
export const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"
];

interface UseCalendarNavigationProps {
  month?: Date;
  selected?: Date;
}

export function useCalendarNavigation({ month, selected }: UseCalendarNavigationProps) {
  const [viewMonth, setViewMonth] = React.useState(() => {
    if (month) return month;
    if (selected && selected instanceof Date) return selected;
    return new Date();
  });

  React.useEffect(() => {
    if (month) setViewMonth(month);
  }, [month]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    setViewMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(newMonth);
      return d;
    });
  };
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    setViewMonth((prev) => {
      const d = new Date(prev);
      d.setFullYear(newYear);
      return d;
    });
  };

  return {
    viewMonth,
    setViewMonth,
    handleMonthChange,
    handleYearChange
  };
}
