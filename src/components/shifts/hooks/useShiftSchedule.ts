
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
    refreshScheduledCounts,
    shiftsMap 
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
  }, [previousWeek, resetFlexibility, setShowNextDaySchedule]);
  
  const handleNextWeek = useCallback(() => {
    nextWeek();
    resetFlexibility();
    setShowNextDaySchedule(false);
  }, [nextWeek, resetFlexibility, setShowNextDaySchedule]);
  
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
    shiftsMap,
    finalizedDays,
    handleFinalizeDay,
    showNextDaySchedule,
    setShowNextDaySchedule,
    getScheduledEmployeesForDay
  };
};
