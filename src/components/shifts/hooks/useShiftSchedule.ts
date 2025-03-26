
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
  
  const { 
    finalizedDays, 
    handleFinalizeDay, 
    showNextDaySchedule, 
    setShowNextDaySchedule 
  } = useFinalizedDays();
  
  const { getScheduledEmployeesForDay } = useScheduledEmployees(filteredEmployees, shiftsMap);
  
  // Custom previousWeek and nextWeek functions that reset flexibility and shifts
  const previousWeek = useCallback(() => {
    prevWeek();
    resetFlexibility();
    // Do not clear shifts when navigating between weeks anymore
    // clearShifts();
    // setFinalizedDays([]);
    setShowNextDaySchedule(false);
  }, [prevWeek, resetFlexibility, setShowNextDaySchedule]);
  
  const nextWeek = useCallback(() => {
    nextWeekFn();
    resetFlexibility();
    // Do not clear shifts when navigating between weeks anymore
    // clearShifts();
    // setFinalizedDays([]);
    setShowNextDaySchedule(false);
  }, [nextWeekFn, resetFlexibility, setShowNextDaySchedule]);
  
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
