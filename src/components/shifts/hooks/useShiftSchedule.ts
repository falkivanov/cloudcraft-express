
import { useCallback } from "react";
import { Employee } from "@/types/employee";
import { useWeekNavigation } from "./useWeekNavigation";
import { useEmployeeFlexibility } from "./useEmployeeFlexibility";
import { useRequiredEmployees } from "./useRequiredEmployees";
import { useShiftTracker } from "./useShiftTracker";
import { useEmployeeLoader } from "./useEmployeeLoader";
import { useFinalizedDays } from "./useFinalizedDays";
import { useScheduledEmployees } from "./useScheduledEmployees";

export const useShiftSchedule = (initialEmployees: Employee[]) => {
  // Use our smaller hooks
  const { filteredEmployees } = useEmployeeLoader(initialEmployees);
  
  // Combine our smaller hooks
  const weekNavigation = useWeekNavigation();
  const { weekDays, selectedWeek, previousWeek, nextWeek } = weekNavigation;
  
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
    clearAllShifts,
    refreshScheduledCounts,
    shiftsMap,
    setShiftsMap
  } = shiftTracker;
  
  const { 
    finalizedDays, 
    handleFinalizeDay, 
    showNextDaySchedule, 
    setShowNextDaySchedule 
  } = useFinalizedDays();
  
  const { getScheduledEmployeesForDay } = useScheduledEmployees(filteredEmployees, shiftsMap);
  
  // Use the week navigation functions directly with flexibility and shifts reset
  const handlePreviousWeek = useCallback(() => {
    previousWeek();
    resetFlexibility();
    setShowNextDaySchedule(false);
    
    // Force refresh scheduled counts when changing week
    setTimeout(() => {
      refreshScheduledCounts();
    }, 50);
  }, [previousWeek, resetFlexibility, setShowNextDaySchedule, refreshScheduledCounts]);
  
  const handleNextWeek = useCallback(() => {
    nextWeek();
    resetFlexibility();
    setShowNextDaySchedule(false);
    
    // Force refresh scheduled counts when changing week
    setTimeout(() => {
      refreshScheduledCounts();
    }, 50);
  }, [nextWeek, resetFlexibility, setShowNextDaySchedule, refreshScheduledCounts]);
  
  return {
    selectedWeek,
    weekDays,
    filteredEmployees,
    requiredEmployees,
    scheduledEmployees,
    formatDateKey,
    previousWeek: handlePreviousWeek,
    nextWeek: handleNextWeek,
    handleRequiredChange,
    handleFlexibilityOverride,
    confirmFlexibilityOverride,
    isTemporarilyFlexible,
    selectedEmployeeForFlexOverride,
    isFlexOverrideDialogOpen,
    setIsFlexOverrideDialogOpen,
    clearShifts,
    clearAllShifts,
    shiftsMap,
    setShiftsMap,
    finalizedDays,
    handleFinalizeDay,
    showNextDaySchedule,
    setShowNextDaySchedule,
    getScheduledEmployeesForDay,
    refreshScheduledCounts
  };
};
