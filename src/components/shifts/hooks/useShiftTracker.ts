import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ShiftAssignment } from "@/types/shift";
import { ShiftType } from "../utils/shift-utils";

export const useShiftTracker = (weekDays: Date[]) => {
  // Get date string in yyyy-MM-dd format
  const formatDateKey = (date: Date) => format(date, "yyyy-MM-dd");
  
  // Initialize shifts map to track all current assignments
  const [shiftsMap, setShiftsMap] = useState<Map<string, ShiftAssignment>>(new Map());
  
  // Track scheduled employees (only those with shiftType "Arbeit")
  const [scheduledEmployees, setScheduledEmployees] = useState<Record<string, number>>({});
  
  // Clear only regular shifts (preserves special shifts like Termin, Urlaub, Krank)
  const clearShifts = useCallback(() => {
    setShiftsMap(prevMap => {
      const newMap = new Map<string, ShiftAssignment>();
      
      // Keep only special shifts
      prevMap.forEach((shift, key) => {
        if (shift.shiftType === "Termin" || shift.shiftType === "Urlaub" || shift.shiftType === "Krank") {
          newMap.set(key, shift);
        }
      });
      
      return newMap;
    });
    
    // Reset scheduled counts
    const initialScheduled: Record<string, number> = {};
    weekDays.forEach(day => {
      initialScheduled[formatDateKey(day)] = 0;
    });
    setScheduledEmployees(initialScheduled);
  }, [weekDays]);
  
  // Function to refresh the counts when needed (e.g., when changing weeks)
  const refreshScheduledCounts = useCallback(() => {
    const initialScheduled: Record<string, number> = {};
    weekDays.forEach(day => {
      initialScheduled[formatDateKey(day)] = 0;
    });
    return initialScheduled;
  }, [weekDays]);
  
  useEffect(() => {
    // Initialize scheduledEmployees with 0 counts for each day
    const initialScheduled: Record<string, number> = {};
    weekDays.forEach(day => {
      initialScheduled[formatDateKey(day)] = 0;
    });
    setScheduledEmployees(initialScheduled);
    
    // Listen for shift assignments
    const handleShiftAssigned = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { assignment, action } = customEvent.detail;
      
      if (!assignment || !assignment.date) {
        console.error("Invalid assignment data:", customEvent.detail);
        return;
      }
      
      console.log(`Shift event received:`, { assignment, action });
      
      // Update the shiftsMap first
      setShiftsMap(prevMap => {
        const newMap = new Map(prevMap);
        const key = `${assignment.employeeId}-${assignment.date}`;
        
        if (action === 'add') {
          newMap.set(key, assignment);
        } else if (action === 'remove') {
          newMap.delete(key);
        }
        
        return newMap;
      });
    };
    
    document.addEventListener('shiftAssigned', handleShiftAssigned);
    
    return () => {
      document.removeEventListener('shiftAssigned', handleShiftAssigned);
    };
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
    shiftsMap,
    scheduledEmployees,
    formatDateKey,
    clearShifts,
    refreshScheduledCounts
  };
};
