
import React, { useEffect } from "react";
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
  
  // Log the number of employees loaded to help debug
  useEffect(() => {
    console.log(`ShiftSchedule rendered with ${filteredEmployees.length} active employees`);
    if (filteredEmployees.length === 0) {
      // Wenn keine Mitarbeiter geladen wurden, stellen wir sicher, dass localStorage korrekt initialisiert ist
      try {
        const savedEmployees = localStorage.getItem('employees');
        if (!savedEmployees) {
          console.log('Initializing employees in localStorage with sample data');
          localStorage.setItem('employees', JSON.stringify(initialEmployees));
        }
      } catch (error) {
        console.error('Error checking/setting employees in localStorage:', error);
      }
    }
  }, [filteredEmployees]);
  
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
    <div className="space-y-4 w-full">
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
      
      <div className="w-full overflow-auto">
        {filteredEmployees.length > 0 ? (
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
        ) : (
          <div className="p-6 text-center bg-white border rounded-lg shadow">
            <p className="text-lg text-gray-600 mb-2">Keine aktiven Mitarbeiter gefunden.</p>
            <p className="text-sm text-gray-500">
              Bitte fügen Sie aktive Mitarbeiter hinzu, um mit der Dienstplanung zu beginnen.
            </p>
          </div>
        )}
      </div>

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
