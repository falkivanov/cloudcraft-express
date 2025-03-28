
import React, { useEffect } from "react";
import { initialEmployees } from "@/data/sampleEmployeeData";
import FlexibilityOverrideDialog from "./FlexibilityOverrideDialog";
import { useShiftSchedule } from "./hooks/useShiftSchedule";
import { useAutoPlanningActions } from "./hooks/useAutoPlanningActions";
import ScheduleToolbar from "./ScheduleToolbar";
import ScheduleTable from "./ScheduleTable";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ShiftSchedule = () => {
  const { toast } = useToast();
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
    clearAllShifts,
    shiftsMap,
    finalizedDays,
    handleFinalizeDay,
    showNextDaySchedule,
    setShowNextDaySchedule,
    getScheduledEmployeesForDay,
    refreshScheduledCounts
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
  
  // Add an effect to log scheduled employees whenever it changes
  useEffect(() => {
    console.log("Current scheduled employees state:", scheduledEmployees);
  }, [scheduledEmployees]);
  
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
  
  const handleClearAllShifts = () => {
    // Zeige einen Toast als Bestätigung an
    toast({
      title: "Dienstplan zurückgesetzt",
      description: "Der gesamte Dienstplan für die Woche wurde gelöscht.",
    });
    
    // Lösche alle Schichten
    clearAllShifts();
    
    // Forcefully refresh the scheduled counts immediately after clearing
    setTimeout(() => {
      refreshScheduledCounts();
    }, 50);
  };
  
  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
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
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleClearAllShifts}
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2Icon className="mr-1 h-4 w-4" />
          Komplette Woche löschen
        </Button>
      </div>
      
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
