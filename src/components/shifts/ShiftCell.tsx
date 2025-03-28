
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
  workingDaysAWeek?: number;
}

const ShiftCell: React.FC<ShiftCellProps> = ({ 
  employeeId, 
  date, 
  preferredDays, 
  dayOfWeek,
  isFlexible = true,
  workingDaysAWeek = 5
}) => {
  const [shift, setShift] = useState<ShiftType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const isFullTime = workingDaysAWeek >= 5;
  const isPreferredDay = preferredDays.includes(dayOfWeek);
  
  // Try to load initial shift from localStorage on mount
  useEffect(() => {
    try {
      const shiftsMapData = localStorage.getItem('shiftsMap');
      if (shiftsMapData) {
        const shiftsObject = JSON.parse(shiftsMapData);
        const shiftKey = `${employeeId}-${date}`;
        
        if (shiftsObject[shiftKey]) {
          setShift(shiftsObject[shiftKey].shiftType);
        } else {
          // If no shift is found for this cell, explicitly set to null
          setShift(null);
        }
      } else {
        // If no shiftsMap exists at all, explicitly set to null
        setShift(null);
      }
    } catch (error) {
      console.error('Error loading initial shift data:', error);
      // On error, explicitly set to null
      setShift(null);
    }
  }, [employeeId, date]);
  
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
    // Full-time employees can always be assigned to any day
    if (!isFullTime && shiftType !== null && !isPreferredDay && !isFlexible) {
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
  }, [shift, employeeId, date, isPreferredDay, isFlexible, isFullTime, toast]);
  
  // For part-time employees who are not flexible and it's not a preferred day, show unavailable cell
  if (!isFullTime && !isFlexible && !isPreferredDay) {
    return <UnavailableCell />;
  }
  
  const backgroundColorClass = getBackgroundColorClass(shift, isPreferredDay, isFlexible || isFullTime);
  
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
