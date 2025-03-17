
import React, { useState, useEffect } from "react";
import { initialEmployees } from "@/data/sampleEmployeeData";
import WeekNavigation from "./WeekNavigation";
import EmployeeFilter from "./EmployeeFilter";
import ScheduleTableHeader from "./ScheduleTableHeader";
import EmployeeRow from "./EmployeeRow";
import FlexibilityOverrideDialog from "./FlexibilityOverrideDialog";
import { useShiftSchedule } from "./hooks/useShiftSchedule";
import { Button } from "@/components/ui/button";
import { ZapIcon, AlertCircleIcon, CalendarIcon, CalendarPlusIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createAutomaticPlan, canAutoPlan } from "./utils/auto-planning-utils";
import { dispatchShiftEvent } from "./utils/shift-utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type PlanningMode = "forecast" | "maximum";

const ShiftSchedule = () => {
  const { toast } = useToast();
  const [isAutoPlanningLoading, setIsAutoPlanningLoading] = useState(false);
  const [planningMode, setPlanningMode] = useState<PlanningMode>("forecast");
  const [isPlanningOptionsOpen, setIsPlanningOptionsOpen] = useState(false);
  
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
    clearShifts
  } = useShiftSchedule(initialEmployees);
  
  // Effect to ensure loading state is cleared after a timeout
  useEffect(() => {
    let timeout: number | undefined;
    
    if (isAutoPlanningLoading) {
      // Force reset loading state after 15 seconds max
      timeout = window.setTimeout(() => {
        setIsAutoPlanningLoading(false);
        toast({
          title: "Planung unterbrochen",
          description: "Die automatische Planung hat zu lange gedauert und wurde unterbrochen.",
          variant: "destructive",
        });
      }, 15000);
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isAutoPlanningLoading, toast]);
  
  const handleAutomaticPlanning = () => {
    setIsPlanningOptionsOpen(false);
    setIsAutoPlanningLoading(true);
    
    // Clear existing shifts before auto-planning
    clearShifts();
    
    try {
      // Generate the plan with the selected mode
      const plan = createAutomaticPlan({
        employees: filteredEmployees,
        weekDays,
        requiredEmployees,
        isTemporarilyFlexible,
        formatDateKey,
        planningMode
      });
      
      // Small delay to allow clearing shifts to finish
      setTimeout(() => {
        try {
          // Apply the plan by dispatching events for each assignment
          plan.forEach(({ employeeId, date, shiftType }) => {
            dispatchShiftEvent(employeeId, date, shiftType, 'add');
          });
          
          toast({
            title: "Automatische Planung abgeschlossen",
            description: `${plan.length} Schichten wurden zugewiesen.`,
          });
        } catch (error) {
          console.error("Error applying plan:", error);
          toast({
            title: "Fehler bei der Planung",
            description: "Es gab einen Fehler beim Zuweisen der Schichten.",
            variant: "destructive",
          });
        } finally {
          setIsAutoPlanningLoading(false);
        }
      }, 200);
    } catch (error) {
      console.error("Error creating plan:", error);
      setIsAutoPlanningLoading(false);
      toast({
        title: "Fehler bei der Planung",
        description: "Es gab einen Fehler bei der automatischen Planung.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <WeekNavigation 
          selectedWeek={selectedWeek}
          onPreviousWeek={previousWeek}
          onNextWeek={nextWeek}
        />
        
        <div className="flex items-center gap-2">
          <Popover open={isPlanningOptionsOpen} onOpenChange={setIsPlanningOptionsOpen}>
            <PopoverTrigger asChild>
              <Button
                disabled={isAutoPlanningLoading}
                className="bg-black hover:bg-gray-800"
              >
                {isAutoPlanningLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Plane...
                  </>
                ) : (
                  <>
                    <ZapIcon className="mr-2 h-4 w-4" />
                    Automatisch planen
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="space-y-4">
                <h4 className="font-medium">Planungsmodus wählen</h4>
                <RadioGroup 
                  value={planningMode} 
                  onValueChange={(value) => setPlanningMode(value as PlanningMode)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="forecast" id="forecast" />
                    <Label htmlFor="forecast" className="flex items-center gap-1.5">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Nach Forecast planen</span>
                    </Label>
                  </div>
                  <div className="text-xs text-muted-foreground ml-6">
                    Nur so viele Mitarbeiter einplanen, wie im Forecast benötigt
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="maximum" id="maximum" />
                    <Label htmlFor="maximum" className="flex items-center gap-1.5">
                      <CalendarPlusIcon className="h-4 w-4" />
                      <span>Maximal planen</span>
                    </Label>
                  </div>
                  <div className="text-xs text-muted-foreground ml-6">
                    So viele Mitarbeiter wie möglich einplanen, unabhängig vom Forecast
                  </div>
                </RadioGroup>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleAutomaticPlanning}
                    disabled={isAutoPlanningLoading}
                  >
                    Jetzt planen
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <EmployeeFilter onFilterChange={() => {}} />
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <ScheduleTableHeader 
            weekDays={weekDays}
            requiredEmployees={requiredEmployees}
            scheduledEmployees={scheduledEmployees}
            onRequiredChange={handleRequiredChange}
            formatDateKey={formatDateKey}
          />
          <tbody>
            {filteredEmployees.map((employee) => (
              <EmployeeRow
                key={employee.id}
                employee={employee}
                weekDays={weekDays}
                formatDateKey={formatDateKey}
                onFlexibilityOverride={handleFlexibilityOverride}
                isTemporarilyFlexible={isTemporarilyFlexible}
              />
            ))}
          </tbody>
        </table>
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
