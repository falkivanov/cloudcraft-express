
import React from "react";
import { initialEmployees } from "@/data/sampleEmployeeData";
import FlexibilityOverrideDialog from "./FlexibilityOverrideDialog";
import { useShiftSchedule } from "./hooks/useShiftSchedule";
import { useAutoPlanningActions } from "./hooks/useAutoPlanningActions";
import ScheduleToolbar from "./ScheduleToolbar";
import ScheduleTable from "./ScheduleTable";

const ShiftSchedule = () => {
  const {
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
  } = useShiftSchedule(initialEmployees);
  
  const {
    isAutoPlanningLoading,
    planningMode,
    setPlanningMode,
    isPlanningOptionsOpen,
    setIsPlanningOptionsOpen,
    handleAutomaticPlanning
  } = useAutoPlanningActions({
    filteredEmployees,
    weekDays,
    requiredEmployees,
    isTemporarilyFlexible,
    formatDateKey,
    clearShifts,
    shiftsMap
  });
  
  return (
    <div className="space-y-4">
      <ScheduleToolbar 
        selectedWeek={selectedWeek}
        previousWeek={previousWeek}
        nextWeek={nextWeek}
        planningMode={planningMode}
        setPlanningMode={setPlanningMode}
        onPlanNow={handleAutomaticPlanning}
        isAutoPlanningLoading={isAutoPlanningLoading}
        isPlanningOptionsOpen={isPlanningOptionsOpen}
        setIsPlanningOptionsOpen={setIsPlanningOptionsOpen}
      />
      
      <ScheduleTable 
        weekDays={weekDays}
        filteredEmployees={filteredEmployees}
        requiredEmployees={requiredEmployees}
        scheduledEmployees={scheduledEmployees}
        handleRequiredChange={handleRequiredChange}
        formatDateKey={formatDateKey}
        onFlexibilityOverride={handleFlexibilityOverride}
        isTemporarilyFlexible={isTemporarilyFlexible}
        finalizedDays={finalizedDays}
        onFinalizeDay={handleFinalizeDay}
        showNextDaySchedule={showNextDaySchedule}
        getScheduledEmployeesForDay={getScheduledEmployeesForDay}
        setShowNextDaySchedule={setShowNextDaySchedule}
      />

      <FlexibilityOverrideDialog
        open={isFlexOverrideDialogOpen}
        onOpenChange={setIsFlexOverrideDialogOpen}
        employee={selectedEmployeeForFlexOverride}
        onConfirm={confirmFlexibilityOverride}
      />
    </div>
  );
};

export default ShiftSchedule;
