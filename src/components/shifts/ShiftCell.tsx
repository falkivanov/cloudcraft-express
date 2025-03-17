
import React, { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ShiftType, dispatchShiftEvent, getBackgroundColorClass } from "./utils/shift-utils";
import UnavailableCell from "./UnavailableCell";
import ShiftSelectionMenu from "./ShiftSelectionMenu";

interface ShiftCellProps {
  employeeId: string;
  date: string;
  preferredDays: string[];
  dayOfWeek: string;
  isFlexible?: boolean;
}

const ShiftCell: React.FC<ShiftCellProps> = ({ 
  employeeId, 
  date, 
  preferredDays, 
  dayOfWeek,
  isFlexible = true 
}) => {
  const [shift, setShift] = useState<ShiftType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const isPreferredDay = preferredDays.includes(dayOfWeek);
  
  // Listen for external shift assignment changes (e.g., from auto-planning)
  useEffect(() => {
    const handleShiftAssigned = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { assignment, action } = customEvent.detail;
      
      // Only update this cell if the assignment matches this cell
      if (assignment.employeeId === employeeId && assignment.date === date) {
        if (action === 'add') {
          setShift(assignment.shiftType);
        } else if (action === 'remove') {
          setShift(null);
        }
      }
    };
    
    document.addEventListener('shiftAssigned', handleShiftAssigned);
    
    return () => {
      document.removeEventListener('shiftAssigned', handleShiftAssigned);
    };
  }, [employeeId, date]);
  
  const handleShiftSelect = useCallback((shiftType: ShiftType) => {
    if (shiftType !== null && !isPreferredDay && !isFlexible) {
      toast({
        title: "Nicht möglich",
        description: "Dieser Mitarbeiter kann nur an den angegebenen Arbeitstagen arbeiten.",
        variant: "destructive",
      });
      return;
    }
    
    // Store the current shift before changing it
    const previousShiftType = shift;
    
    // Update local state first
    setShift(shiftType);
    
    // Then dispatch events
    const action = shiftType !== null ? 'add' : 'remove';
    dispatchShiftEvent(employeeId, date, shiftType, action, previousShiftType);
  }, [shift, employeeId, date, isPreferredDay, isFlexible, toast]);
  
  // If employee is not flexible and this day is not preferred, show unavailable cell
  if (!isFlexible && !isPreferredDay) {
    return <UnavailableCell />;
  }
  
  const backgroundColorClass = getBackgroundColorClass(shift, isPreferredDay, isFlexible);
  
  return (
    <ShiftSelectionMenu
      shift={shift}
      isLoading={isLoading}
      backgroundColorClass={backgroundColorClass}
      onShiftSelect={handleShiftSelect}
    />
  );
};

export default ShiftCell;
