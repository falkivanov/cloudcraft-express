
import { useState, useEffect } from "react";
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
  
  // Function to refresh the counts when needed (e.g., when changing weeks)
  const refreshScheduledCounts = () => {
    const initialScheduled: Record<string, number> = {};
    weekDays.forEach(day => {
      initialScheduled[formatDateKey(day)] = 0;
    });
    return initialScheduled;
  };
  
  // Initialize scheduled counts
  useEffect(() => {
    const initialScheduled = refreshScheduledCounts();
    setScheduledEmployees(initialScheduled);
  }, [weekDays]);
  
  // Effect to recalculate scheduled counts whenever shiftsMap changes
  useEffect(() => {
    const newScheduledCounts: Record<string, number> = {};
    
    // Initialize with 0 for all days
    weekDays.forEach(day => {
      newScheduledCounts[formatDateKey(day)] = 0;
    });
    
    // Count all shifts of type "Arbeit" for each day
    shiftsMap.forEach(shift => {
      if (shift.shiftType === "Arbeit") {
        const date = shift.date;
        newScheduledCounts[date] = (newScheduledCounts[date] || 0) + 1;
      }
    });
    
    console.log("Updated scheduled counts:", newScheduledCounts);
    setScheduledEmployees(newScheduledCounts);
  }, [shiftsMap, weekDays]);
  
  return {
    scheduledEmployees,
    formatDateKey,
    refreshScheduledCounts
  };
};
