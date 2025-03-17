
import { useState, useEffect } from "react";
import { Employee } from "@/types/employee";
import { useWeekNavigation } from "./useWeekNavigation";
import { useEmployeeFlexibility } from "./useEmployeeFlexibility";
import { useRequiredEmployees } from "./useRequiredEmployees";
import { useShiftTracker } from "./useShiftTracker";

export const useShiftSchedule = (initialEmployees: Employee[]) => {
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(
    initialEmployees.filter(emp => emp.status === "Aktiv")
  );
  
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
    refreshScheduledCounts 
  } = shiftTracker;
  
  // Custom previousWeek and nextWeek functions that reset flexibility and shifts
  const previousWeek = () => {
    prevWeek();
    resetFlexibility();
    clearShifts();
    setScheduledEmployees(refreshScheduledCounts());
  };
  
  const nextWeek = () => {
    nextWeekFn();
    resetFlexibility();
    clearShifts();
    setScheduledEmployees(refreshScheduledCounts());
  };
  
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
    clearShifts
  };
};
