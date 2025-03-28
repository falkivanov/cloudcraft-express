
import { useState, useEffect, useCallback } from "react";
import { ShiftAssignment } from "@/types/shift";
import { format } from "date-fns";

/**
 * Hook for tracking employee schedule counts
 */
export const useScheduledCounts = (
  weekDays: Date[],
  shiftsMap: Map<string, ShiftAssignment>
) => {
  // Format date string in yyyy-MM-dd format
  const formatDateKey = (date: Date) => format(date, "yyyy-MM-dd");
  
  // Track scheduled employees (only those with shiftType "Arbeit")
  const [scheduledEmployees, setScheduledEmployees] = useState<Record<string, number>>({});
  
  // Function to refresh the counts when needed (e.g., when changing weeks or clearing shifts)
  const refreshScheduledCounts = useCallback(() => {
    const initialScheduled: Record<string, number> = {};
    
    // Initialize with 0 for all days
    weekDays.forEach(day => {
      initialScheduled[formatDateKey(day)] = 0;
    });
    
    // Count all shifts of type "Arbeit" for each day
    shiftsMap.forEach(shift => {
      if (shift.shiftType === "Arbeit") {
        const date = shift.date;
        initialScheduled[date] = (initialScheduled[date] || 0) + 1;
      }
    });
    
    console.log("Forcefully refreshing scheduled counts:", initialScheduled);
    setScheduledEmployees(initialScheduled);
    
    return initialScheduled;
  }, [weekDays, shiftsMap]);
  
  // Initialize scheduled counts on mount and whenever relevant dependencies change
  useEffect(() => {
    refreshScheduledCounts();
  }, [weekDays, shiftsMap, refreshScheduledCounts]);
  
  return {
    scheduledEmployees,
    formatDateKey,
    refreshScheduledCounts
  };
};
