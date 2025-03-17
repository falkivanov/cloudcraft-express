
import { useState, useCallback } from "react";
import { addDays, startOfWeek } from "date-fns";

export const useWeekNavigation = () => {
  const [currentDate] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  // Generate days of the week starting from Monday (6 days only, excluding Sunday)
  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(selectedWeek, i));
  
  const previousWeek = useCallback(() => {
    const prevWeek = addDays(selectedWeek, -7);
    setSelectedWeek(prevWeek);
    return prevWeek;
  }, [selectedWeek]);
  
  const nextWeek = useCallback(() => {
    const nextWeek = addDays(selectedWeek, 7);
    setSelectedWeek(nextWeek);
    return nextWeek;
  }, [selectedWeek]);
  
  return {
    currentDate,
    selectedWeek,
    weekDays,
    previousWeek,
    nextWeek
  };
};
