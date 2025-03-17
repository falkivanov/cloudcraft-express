
import { useState, useCallback } from "react";
import { Employee } from "@/types/employee";
import { useToast } from "@/components/ui/use-toast";

export const useEmployeeFlexibility = () => {
  const [temporaryFlexibleEmployees, setTemporaryFlexibleEmployees] = useState<string[]>([]);
  const [selectedEmployeeForFlexOverride, setSelectedEmployeeForFlexOverride] = useState<Employee | null>(null);
  const [isFlexOverrideDialogOpen, setIsFlexOverrideDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const handleFlexibilityOverride = useCallback((employee: Employee) => {
    setSelectedEmployeeForFlexOverride(employee);
    setIsFlexOverrideDialogOpen(true);
  }, []);
  
  const confirmFlexibilityOverride = useCallback(() => {
    if (selectedEmployeeForFlexOverride) {
      // Add to temporary flexible employees list
      setTemporaryFlexibleEmployees(prev => [...prev, selectedEmployeeForFlexOverride.id]);
      
      // Show toast notification
      toast({
        title: "Flexibilität temporär aufgehoben",
        description: `${selectedEmployeeForFlexOverride.name} kann in dieser Woche an allen Tagen eingeplant werden.`,
      });
      
      setIsFlexOverrideDialogOpen(false);
      setSelectedEmployeeForFlexOverride(null);
    }
  }, [selectedEmployeeForFlexOverride, toast]);
  
  // Check if an employee has temporarily overridden flexibility
  const isTemporarilyFlexible = useCallback((employeeId: string) => {
    return temporaryFlexibleEmployees.includes(employeeId);
  }, [temporaryFlexibleEmployees]);
  
  const resetFlexibility = useCallback(() => {
    setTemporaryFlexibleEmployees([]);
  }, []);

  return {
    temporaryFlexibleEmployees,
    selectedEmployeeForFlexOverride,
    isFlexOverrideDialogOpen,
    setIsFlexOverrideDialogOpen,
    handleFlexibilityOverride,
    confirmFlexibilityOverride,
    isTemporarilyFlexible,
    resetFlexibility
  };
};
