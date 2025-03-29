
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { createAutomaticPlan } from "../utils/planning";
import { dispatchShiftEvent } from "../utils/shift-utils";
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";

type PlanningMode = "forecast" | "maximum";

interface UseAutoPlanningProps {
  filteredEmployees: Employee[];
  weekDays: Date[];
  requiredEmployees: Record<number, number>;
  isTemporarilyFlexible: (employeeId: string) => boolean;
  formatDateKey: (date: Date) => string;
  clearShifts: () => void;
  shiftsMap: Map<string, ShiftAssignment>;
}

export const useAutoPlanningActions = ({
  filteredEmployees,
  weekDays,
  requiredEmployees,
  isTemporarilyFlexible,
  formatDateKey,
  clearShifts,
  shiftsMap
}: UseAutoPlanningProps) => {
  const { toast } = useToast();
  const [isAutoPlanningLoading, setIsAutoPlanningLoading] = useState(false);
  const [planningMode, setPlanningMode] = useState<PlanningMode>("forecast");
  const [isPlanningOptionsOpen, setIsPlanningOptionsOpen] = useState(false);
  
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
    
    try {
      // Before generating the plan, analyze the situation
      const totalRequired = Object.values(requiredEmployees).reduce((sum, req) => sum + (req || 0), 0);
      const totalWeekendRequired = (requiredEmployees[5] || 0) + (requiredEmployees[6] || 0);
      const totalWeekdayRequired = totalRequired - totalWeekendRequired;
      
      console.log(`Planning analysis: Total required: ${totalRequired}, Weekend: ${totalWeekendRequired}, Weekday: ${totalWeekdayRequired}`);
      
      // Check if we have enough employees
      const maxPossibleShifts = filteredEmployees.reduce((sum, emp) => {
        // Calculate max shifts this employee can work
        const maxShifts = emp.wantsToWorkSixDays ? 6 : emp.workingDaysAWeek;
        return sum + maxShifts;
      }, 0);
      
      console.log(`Max possible shifts with all employees: ${maxPossibleShifts} vs ${totalRequired} required`);
      
      if (maxPossibleShifts < totalRequired) {
        console.log("WARNING: Not enough employees to fill all required shifts!");
        
        // Still continue with planning, but show warning
        toast({
          title: "Warnung: Nicht genug Mitarbeiter",
          description: `Es werden insgesamt ${totalRequired} Schichten benötigt, aber maximal ${maxPossibleShifts} können durch die verfügbaren Mitarbeiter abgedeckt werden.`,
          variant: "destructive", // Changed from "warning" to "destructive" since "warning" is not a valid variant
        });
      }
      
      // Generate the plan with the selected mode
      const { workShifts, freeShifts } = createAutomaticPlan({
        employees: filteredEmployees,
        weekDays,
        requiredEmployees,
        isTemporarilyFlexible,
        formatDateKey,
        planningMode,
        existingShifts: shiftsMap
      });
      
      // Small delay to allow UI to update
      setTimeout(() => {
        try {
          // Apply the plan by dispatching events for each assignment
          workShifts.forEach(({ employeeId, date, shiftType }) => {
            // Get the existing shift for this employee and date
            const shiftKey = `${employeeId}-${date}`;
            const existingShift = shiftsMap.get(shiftKey);
            
            // Only override if:
            // 1. There's no existing shift, or
            // 2. The existing shift is "Frei"
            if (!existingShift || existingShift.shiftType === "Frei") {
              dispatchShiftEvent(employeeId, date, shiftType, 'add');
            }
          });
          
          // Set all unassigned but available employees to "Frei"
          freeShifts.forEach(({ employeeId, date }) => {
            const shiftKey = `${employeeId}-${date}`;
            const existingShift = shiftsMap.get(shiftKey);
            
            // Only set to "Frei" if there's no existing shift
            // or if the existing shift is not a special type (Termin, Urlaub, Krank)
            if (!existingShift || 
               (existingShift.shiftType !== "Termin" && 
                existingShift.shiftType !== "Urlaub" && 
                existingShift.shiftType !== "Krank")) {
              dispatchShiftEvent(employeeId, date, "Frei", 'add');
            }
          });
          
          toast({
            title: "Automatische Planung abgeschlossen",
            description: `${workShifts.length} Arbeit-Schichten und ${freeShifts.length} Frei-Schichten wurden zugewiesen.`,
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
  
  return {
    isAutoPlanningLoading,
    planningMode,
    setPlanningMode,
    isPlanningOptionsOpen,
    setIsPlanningOptionsOpen,
    handleAutomaticPlanning
  };
};
