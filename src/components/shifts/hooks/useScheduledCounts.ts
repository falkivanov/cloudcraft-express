
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
    // Create a new object to hold counts
    const initialScheduled: Record<string, number> = {};
    
    // Initialize with 0 for all days
    weekDays.forEach(day => {
      initialScheduled[formatDateKey(day)] = 0;
    });
    
    // Count all shifts of type "Arbeit" for each day
    if (shiftsMap && shiftsMap.size > 0) {
      shiftsMap.forEach(shift => {
        if (shift.shiftType === "Arbeit") {
          const date = shift.date;
          initialScheduled[date] = (initialScheduled[date] || 0) + 1;
        }
      });
    }
    
    console.log("Refreshing scheduled counts:", initialScheduled);
    console.log("Total shifts in map:", shiftsMap.size);
    console.log("Total 'Arbeit' shifts:", Array.from(shiftsMap.values()).filter(s => s.shiftType === "Arbeit").length);
    
    // Log 'Arbeit' shifts by date for debugging
    const arbeitShiftsByDate = Array.from(shiftsMap.values())
      .filter(s => s.shiftType === "Arbeit")
      .reduce((acc, shift) => {
        acc[shift.date] = (acc[shift.date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    console.log("'Arbeit' shifts by date:", arbeitShiftsByDate);
    
    // Compare with our counts to ensure they match
    weekDays.forEach(day => {
      const dateKey = formatDateKey(day);
      const counted = initialScheduled[dateKey] || 0;
      const fromMap = arbeitShiftsByDate[dateKey] || 0;
      
      if (counted !== fromMap) {
        console.error(`Count mismatch for ${dateKey}: counted=${counted}, fromMap=${fromMap}`);
        // Fix the count to match what's in the shiftsMap
        initialScheduled[dateKey] = fromMap;
      }
    });
    
    // Update the state with new counts
    setScheduledEmployees(initialScheduled);
    
    return initialScheduled;
  }, [weekDays, shiftsMap, formatDateKey]);
  
  // Initialize scheduled counts on mount and whenever relevant dependencies change
  useEffect(() => {
    const counts = refreshScheduledCounts();
    console.log("Updated scheduled counts:", counts);
  }, [weekDays, shiftsMap, refreshScheduledCounts]);
  
  return {
    scheduledEmployees,
    formatDateKey,
    refreshScheduledCounts
  };
};
