
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { createAutomaticPlan } from "../utils/auto-planning-utils";
import { dispatchShiftEvent } from "../utils/shift-utils";
import { Employee } from "@/types/employee";

type PlanningMode = "forecast" | "maximum";

interface UseAutoPlanningProps {
  filteredEmployees: Employee[];
  weekDays: Date[];
  requiredEmployees: Record<number, number>;
  isTemporarilyFlexible: (employeeId: string) => boolean;
  formatDateKey: (date: Date) => string;
  clearShifts: () => void;
}

export const useAutoPlanningActions = ({
  filteredEmployees,
  weekDays,
  requiredEmployees,
  isTemporarilyFlexible,
  formatDateKey,
  clearShifts
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
  
  return {
    isAutoPlanningLoading,
    planningMode,
    setPlanningMode,
    isPlanningOptionsOpen,
    setIsPlanningOptionsOpen,
    handleAutomaticPlanning
  };
};
