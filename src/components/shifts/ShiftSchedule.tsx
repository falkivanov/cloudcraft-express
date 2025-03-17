
import React, { useState, useEffect } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { de } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { initialEmployees } from "@/data/sampleEmployeeData";
import { Employee } from "@/types/employee";
import ShiftCell from "./ShiftCell";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { ShiftAssignment } from "@/types/shift";

const ShiftSchedule = () => {
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
        // In a real app, you would likely fetch current assignments or track them in state
        // For simplicity, we'll reset the counter for the day and rely on re-assignments
        // to rebuild the counts
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
    
    // In a real app, you would fetch current assignments from backend
    // and update the counts based on those with shiftType === "Arbeit"
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
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={previousWeek}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <div className="flex items-center px-3 py-2 bg-muted rounded-md">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>
              {format(selectedWeek, "dd.MM.yyyy", { locale: de })} - {format(addDays(selectedWeek, 5), "dd.MM.yyyy", { locale: de })}
            </span>
          </div>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
        
        <Select defaultValue="aktiv">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aktiv">Aktive Mitarbeiter</SelectItem>
            <SelectItem value="all">Alle Mitarbeiter</SelectItem>
            <SelectItem value="preferred">Bevorzugte Arbeitszeiten</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left min-w-[200px]">
                <div>Mitarbeiter</div>
                <div className="mt-2 text-xs flex justify-between items-center">
                  <span>Forecast:</span>
                  <span className="text-xs ml-2">Geplant:</span>
                </div>
              </th>
              {weekDays.map((day, index) => {
                const dateKey = formatDateKey(day);
                const scheduledCount = scheduledEmployees[dateKey] || 0;
                const requiredCount = requiredEmployees[index];
                
                return (
                  <th key={day.toString()} className="p-3 text-center border-l">
                    <div className="font-medium">
                      {format(day, "EEEE", { locale: de })}
                    </div>
                    <div className="text-sm font-normal">
                      {format(day, "dd.MM.", { locale: de })}
                    </div>
                    <div className="mt-1 flex justify-center space-x-2 items-center">
                      <Input
                        type="number"
                        min="0"
                        value={requiredCount}
                        onChange={(e) => handleRequiredChange(index, e.target.value)}
                        className="w-10 h-6 text-center px-1"
                      />
                      <span className={`text-xs font-medium ${scheduledCount < requiredCount ? 'text-red-500' : 'text-green-500'}`}>
                        {scheduledCount}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.id} className="border-t">
                <td className="p-3 font-medium">
                  {employee.name}
                  <div className="text-xs text-muted-foreground">
                    {employee.preferredWorkingDays.join(', ')}
                    {!employee.isWorkingDaysFlexible && (
                      <span 
                        className="ml-1 text-red-500 font-medium cursor-pointer hover:underline"
                        onClick={() => handleFlexibilityOverride(employee)}
                        title="Klicken, um Flexibilität für diese Woche zu aktivieren"
                      >
                        {isTemporarilyFlexible(employee.id) 
                          ? "(temporär flexibel)" 
                          : "(nicht flexibel)"}
                      </span>
                    )}
                  </div>
                </td>
                {weekDays.map((day) => (
                  <td key={day.toString()} className="border-l p-0 h-14">
                    <ShiftCell 
                      employeeId={employee.id} 
                      date={formatDateKey(day)}
                      preferredDays={employee.preferredWorkingDays}
                      dayOfWeek={format(day, "EEEEEE", { locale: de })}
                      isFlexible={employee.isWorkingDaysFlexible || isTemporarilyFlexible(employee.id)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alert Dialog for flexibility override confirmation */}
      <AlertDialog 
        open={isFlexOverrideDialogOpen} 
        onOpenChange={setIsFlexOverrideDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Flexibilität vorübergehend aufheben?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie die Arbeitstage-Einschränkung für {selectedEmployeeForFlexOverride?.name} für diese Woche aufheben?
              Der Mitarbeiter kann dann für die aktuelle Woche an allen Tagen eingeplant werden, nicht nur an den bevorzugten Tagen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmFlexibilityOverride}>
              Bestätigen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ShiftSchedule;
