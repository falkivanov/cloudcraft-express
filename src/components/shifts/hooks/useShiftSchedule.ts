
import { useState, useEffect, useCallback } from "react";
import { Employee } from "@/types/employee";
import { useWeekNavigation } from "./useWeekNavigation";
import { useEmployeeFlexibility } from "./useEmployeeFlexibility";
import { useRequiredEmployees } from "./useRequiredEmployees";
import { useShiftTracker } from "./useShiftTracker";

export const useShiftSchedule = (initialEmployees: Employee[]) => {
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(
    initialEmployees.filter(emp => emp.status === "Aktiv")
  );
  
  // Track finalized days
  const [finalizedDays, setFinalizedDays] = useState<string[]>([]);
  const [showNextDaySchedule, setShowNextDaySchedule] = useState(false);
  
  // Combine our smaller hooks
  const weekNavigation = useWeekNavigation();
  const { weekDays, selectedWeek, previousWeek: prevWeek, nextWeek: nextWeekFn } = weekNavigation;
  
  const employeeFlexibility = useEmployeeFlexibility();
  const { 
    selectedEmployeeForFlexOverride, 
    isFlexOverrideDialogOpen, 
    setIsFlexOverrideDialogOpen,
    handleFlexibilityOverride, 
    confirmFlexibilityOverride, 
    isTemporarilyFlexible,
    resetFlexibility
  } = employeeFlexibility;
  
  const { requiredEmployees, handleRequiredChange } = useRequiredEmployees();
  
  const shiftTracker = useShiftTracker(weekDays);
  const { 
    scheduledEmployees, 
    formatDateKey, 
    clearShifts,
    refreshScheduledCounts,
    shiftsMap 
  } = shiftTracker;
  
  // Custom previousWeek and nextWeek functions that reset flexibility and shifts
  const previousWeek = () => {
    prevWeek();
    resetFlexibility();
    clearShifts();
    setFinalizedDays([]);
    setShowNextDaySchedule(false);
  };
  
  const nextWeek = () => {
    nextWeekFn();
    resetFlexibility();
    clearShifts();
    setFinalizedDays([]);
    setShowNextDaySchedule(false);
  };

  // Memoize the finalize day function to prevent unnecessary rerenders
  const handleFinalizeDay = useCallback((dateKey: string) => {
    console.log(`Finalizing day: ${dateKey}`);
    setFinalizedDays(prev => {
      if (!prev.includes(dateKey)) {
        return [...prev, dateKey];
      }
      return prev;
    });
  }, []);
  
  // Listen for day finalized events (from other components)
  useEffect(() => {
    const handleDayFinalized = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { dateKey } = customEvent.detail;
      
      if (dateKey && !finalizedDays.includes(dateKey)) {
        console.log(`Day finalized event received: ${dateKey}`);
        setFinalizedDays(prev => [...prev, dateKey]);
      }
    };
    
    window.addEventListener('dayFinalized', handleDayFinalized);
    
    return () => {
      window.removeEventListener('dayFinalized', handleDayFinalized);
    };
  }, [finalizedDays]);

  // Debug finalized days state whenever it changes
  useEffect(() => {
    console.log('Finalized days updated:', finalizedDays);
  }, [finalizedDays]);
  
  // Get employees scheduled for work on a specific day
  const getScheduledEmployeesForDay = useCallback((date: string) => {
    const scheduledEmpIds: string[] = [];
    
    // Scan through shiftsMap to find employees with "Arbeit" shifts on the given date
    shiftsMap.forEach((shift, key) => {
      if (shift.date === date && shift.shiftType === "Arbeit") {
        scheduledEmpIds.push(shift.employeeId);
      }
    });
    
    // Return the full employee objects for the scheduled employees
    return filteredEmployees.filter(emp => scheduledEmpIds.includes(emp.id));
  }, [filteredEmployees, shiftsMap]);
  
  return {
    selectedWeek,
    weekDays,
    filteredEmployees,
    requiredEmployees,
    scheduledEmployees,
    formatDateKey,
    previousWeek,
    nextWeek,
    handleRequiredChange,
    handleFlexibilityOverride,
    confirmFlexibilityOverride,
    isTemporarilyFlexible,
    selectedEmployeeForFlexOverride,
    isFlexOverrideDialogOpen,
    setIsFlexOverrideDialogOpen,
    clearShifts,
    shiftsMap,
    finalizedDays,
    handleFinalizeDay,
    showNextDaySchedule,
    setShowNextDaySchedule,
    getScheduledEmployeesForDay
  };
};
