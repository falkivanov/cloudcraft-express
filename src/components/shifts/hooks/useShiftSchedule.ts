
import { useState, useEffect, useCallback } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { Employee } from "@/types/employee";
import { useToast } from "@/components/ui/use-toast";
import { ShiftAssignment } from "@/types/shift";

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
    0: 0, // Monday
    1: 0, // Tuesday
    2: 0, // Wednesday
    3: 0, // Thursday
    4: 0, // Friday
    5: 0, // Saturday
  });
  
  // Track scheduled employees (only those with shiftType "Arbeit")
  const [scheduledEmployees, setScheduledEmployees] = useState<Record<string, number>>({});
  
  // Generate days of the week starting from Monday (6 days only, excluding Sunday)
  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(selectedWeek, i));
  
  // Get date string in yyyy-MM-dd format
  const formatDateKey = (date: Date) => format(date, "yyyy-MM-dd");
  
  // Initialize shifts map to track all current assignments
  const [shiftsMap, setShiftsMap] = useState<Map<string, ShiftAssignment>>(new Map());
  
  // Clear all shifts (used before auto-planning)
  const clearShifts = useCallback(() => {
    setShiftsMap(new Map());
    
    // Reset scheduled counts
    const initialScheduled: Record<string, number> = {};
    weekDays.forEach(day => {
      initialScheduled[formatDateKey(day)] = 0;
    });
    setScheduledEmployees(initialScheduled);
  }, [weekDays]);
  
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
      const { assignment, action } = customEvent.detail;
      
      if (!assignment || !assignment.date) {
        console.error("Invalid assignment data:", customEvent.detail);
        return;
      }
      
      console.log(`Shift event received:`, { assignment, action });
      
      // Update the shiftsMap first
      setShiftsMap(prevMap => {
        const newMap = new Map(prevMap);
        const key = `${assignment.employeeId}-${assignment.date}`;
        
        if (action === 'add') {
          newMap.set(key, assignment);
        } else if (action === 'remove') {
          newMap.delete(key);
        }
        
        return newMap;
      });
    };
    
    document.addEventListener('shiftAssigned', handleShiftAssigned);
    
    return () => {
      document.removeEventListener('shiftAssigned', handleShiftAssigned);
    };
  }, [weekDays]);
  
  // Effect to recalculate scheduled counts whenever shiftsMap changes
  useEffect(() => {
    const newScheduledCounts: Record<string, number> = {};
    
    // Initialize with 0 for all days
    weekDays.forEach(day => {
      newScheduledCounts[formatDateKey(day)] = 0;
    });
    
    // Count all shifts of type "Arbeit" for each day
    shiftsMap.forEach(shift => {
      if (shift.shiftType === "Arbeit") {
        const date = shift.date;
        newScheduledCounts[date] = (newScheduledCounts[date] || 0) + 1;
      }
    });
    
    console.log("Updated scheduled counts:", newScheduledCounts);
    setScheduledEmployees(newScheduledCounts);
  }, [shiftsMap, weekDays]);
  
  // Function to refresh the counts when needed (e.g., when changing weeks)
  const refreshScheduledCounts = useCallback(() => {
    const initialScheduled: Record<string, number> = {};
    weekDays.forEach(day => {
      initialScheduled[formatDateKey(day)] = 0;
    });
    return initialScheduled;
  }, [weekDays]);
  
  const previousWeek = useCallback(() => {
    const prevWeek = addDays(selectedWeek, -7);
    setSelectedWeek(prevWeek);
    // Reset temporary flexibility overrides when changing weeks
    setTemporaryFlexibleEmployees([]);
    
    // Reset shifts map when changing weeks
    setShiftsMap(new Map());
    
    // Reset scheduled counts for the new week
    setScheduledEmployees(refreshScheduledCounts());
  }, [selectedWeek, refreshScheduledCounts]);
  
  const nextWeek = useCallback(() => {
    const nextWeek = addDays(selectedWeek, 7);
    setSelectedWeek(nextWeek);
    // Reset temporary flexibility overrides when changing weeks
    setTemporaryFlexibleEmployees([]);
    
    // Reset shifts map when changing weeks
    setShiftsMap(new Map());
    
    // Reset scheduled counts for the new week
    setScheduledEmployees(refreshScheduledCounts());
  }, [selectedWeek, refreshScheduledCounts]);
  
  const handleRequiredChange = useCallback((dayIndex: number, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    setRequiredEmployees(prev => ({
      ...prev,
      [dayIndex]: numValue
    }));
  }, []);
  
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
