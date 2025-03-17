
import { useState, useEffect } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { Employee } from "@/types/employee";
import { useToast } from "@/components/ui/use-toast";

export const useShiftSchedule = (initialEmployees: Employee[]) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(initialEmployees.filter(emp => emp.status === "Aktiv"));
  const [temporaryFlexibleEmployees, setTemporaryFlexibleEmployees] = useState<string[]>([]);
  const [selectedEmployeeForFlexOverride, setSelectedEmployeeForFlexOverride] = useState<Employee | null>(null);
  const [isFlexOverrideDialogOpen, setIsFlexOverrideDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Track required employees for each day (Mon-Sat)
  const [requiredEmployees, setRequiredEmployees] = useState<Record<number, number>>({
    0: 3, // Monday
    1: 3, // Tuesday
    2: 3, // Wednesday
    3: 3, // Thursday
    4: 3, // Friday
    5: 2, // Saturday
  });
  
  // Track scheduled employees (only those with shiftType "Arbeit")
  const [scheduledEmployees, setScheduledEmployees] = useState<Record<string, number>>({});
  
  // Generate days of the week starting from Monday (6 days only, excluding Sunday)
  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(selectedWeek, i));
  
  // Get date string in yyyy-MM-dd format
  const formatDateKey = (date: Date) => format(date, "yyyy-MM-dd");
  
  useEffect(() => {
    // Initialize scheduledEmployees with 0 counts for each day
    const initialScheduled: Record<string, number> = {};
    weekDays.forEach(day => {
      initialScheduled[formatDateKey(day)] = 0;
    });
    setScheduledEmployees(initialScheduled);
    
    // Listen for shift assignments
    const handleShiftAssigned = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { assignment, action, countAsScheduled } = customEvent.detail;
      
      if (action === 'add') {
        setScheduledEmployees(prev => {
          const newCount = {...prev};
          // Only count if shiftType is "Arbeit"
          if (countAsScheduled) {
            newCount[assignment.date] = (newCount[assignment.date] || 0) + 1;
          }
          return newCount;
        });
      } else if (action === 'remove') {
        // We would need to know the previous shift type to properly decrement
        // For simplicity, we'll reset the counter for the day and rely on re-assignments
        refreshScheduledCounts();
      }
    };
    
    document.addEventListener('shiftAssigned', handleShiftAssigned);
    
    return () => {
      document.removeEventListener('shiftAssigned', handleShiftAssigned);
    };
  }, [weekDays]);
  
  // Function to refresh the counts (simplified version)
  const refreshScheduledCounts = () => {
    const initialScheduled: Record<string, number> = {};
    weekDays.forEach(day => {
      initialScheduled[formatDateKey(day)] = 0;
    });
    setScheduledEmployees(initialScheduled);
  };
  
  const previousWeek = () => {
    const prevWeek = addDays(selectedWeek, -7);
    setSelectedWeek(prevWeek);
    // Reset temporary flexibility overrides when changing weeks
    setTemporaryFlexibleEmployees([]);
    
    // Reset scheduled counts for the new week
    refreshScheduledCounts();
  };
  
  const nextWeek = () => {
    const nextWeek = addDays(selectedWeek, 7);
    setSelectedWeek(nextWeek);
    // Reset temporary flexibility overrides when changing weeks
    setTemporaryFlexibleEmployees([]);
    
    // Reset scheduled counts for the new week
    refreshScheduledCounts();
  };
  
  const handleRequiredChange = (dayIndex: number, value: string) => {
    const numValue = parseInt(value) || 0;
    setRequiredEmployees(prev => ({
      ...prev,
      [dayIndex]: numValue
    }));
  };
  
  const handleFlexibilityOverride = (employee: Employee) => {
    setSelectedEmployeeForFlexOverride(employee);
    setIsFlexOverrideDialogOpen(true);
  };
  
  const confirmFlexibilityOverride = () => {
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
  };
  
  // Check if an employee has temporarily overridden flexibility
  const isTemporarilyFlexible = (employeeId: string) => {
    return temporaryFlexibleEmployees.includes(employeeId);
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
    setIsFlexOverrideDialogOpen
  };
};
