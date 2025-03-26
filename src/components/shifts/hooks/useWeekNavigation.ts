
import { useState, useCallback, useEffect } from "react";
import { addDays, startOfWeek } from "date-fns";

export const useWeekNavigation = () => {
  const [currentDate] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  // Generate days of the week starting from Monday (6 days only, excluding Sunday)
  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(selectedWeek, i));
  
  const previousWeek = useCallback(() => {
    const prevWeek = addDays(selectedWeek, -7);
    setSelectedWeek(prevWeek);
    
    // Dispatch event for week navigation
    try {
      window.dispatchEvent(new CustomEvent('weekChanged', { 
        detail: { direction: 'previous', week: prevWeek } 
      }));
    } catch (error) {
      console.error('Error dispatching weekChanged event:', error);
    }
    
    return prevWeek;
  }, [selectedWeek]);
  
  const nextWeek = useCallback(() => {
    const nextWeek = addDays(selectedWeek, 7);
    setSelectedWeek(nextWeek);
    
    // Dispatch event for week navigation
    try {
      window.dispatchEvent(new CustomEvent('weekChanged', { 
        detail: { direction: 'next', week: nextWeek } 
      }));
    } catch (error) {
      console.error('Error dispatching weekChanged event:', error);
    }
    
    return nextWeek;
  }, [selectedWeek]);
  
  // Add listener for external week changes
  useEffect(() => {
    const handleWeekChanged = (event: Event) => {
      try {
        const customEvent = event as CustomEvent;
        if (customEvent.detail && customEvent.detail.week) {
          setSelectedWeek(customEvent.detail.week);
        }
      } catch (error) {
        console.error('Error handling weekChanged event:', error);
      }
    };
    
    window.addEventListener('weekChanged', handleWeekChanged);
    return () => {
      window.removeEventListener('weekChanged', handleWeekChanged);
    };
  }, []);
  
  return {
    currentDate,
    selectedWeek,
    weekDays,
    previousWeek,
    nextWeek
  };
};
