
import React, { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ShiftType, dispatchShiftEvent, getBackgroundColorClass } from "./utils/shift-utils";
import UnavailableCell from "./UnavailableCell";
import ShiftSelectionMenu from "./ShiftSelectionMenu";
import { isPublicHoliday } from "./utils/planning/date-utils";

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
  
  // Check if the date is a holiday
  const isHoliday = React.useMemo(() => {
    // Convert the date string to a Date object
    if (!date) return false;
    try {
      const dateParts = date.split('-');
      if (dateParts.length !== 3) return false;
      
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
      const day = parseInt(dateParts[2]);
      
      const dateObj = new Date(year, month, day);
      return isPublicHoliday(dateObj);
    } catch (error) {
      console.error("Error checking for holiday:", error);
      return false;
    }
  }, [date]);
  
  // Try to load initial shift from localStorage on mount and whenever date or employeeId changes
  useEffect(() => {
    try {
      const shiftsMapData = localStorage.getItem('shiftsMap');
      if (shiftsMapData) {
        const shiftsObject = JSON.parse(shiftsMapData);
        const shiftKey = `${employeeId}-${date}`;
        
        if (shiftsObject[shiftKey]) {
          console.log(`Loading shift for ${employeeId} on ${date}: ${shiftsObject[shiftKey].shiftType}`);
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
  
  // Listen for external shift assignment changes (e.g., from auto-planning or clearing)
  useEffect(() => {
    const handleShiftAssigned = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { assignment, action } = customEvent.detail;
      
      // Only update this cell if the assignment matches this cell
      if (assignment.employeeId === employeeId && assignment.date === date) {
        console.log(`Shift event for ${employeeId} on ${date}: ${action}, type: ${assignment.shiftType}`);
        
        if (action === 'add') {
          setShift(assignment.shiftType);
        } else if (action === 'remove') {
          setShift(null);
        }
      }
    };
    
    // Listen for clearAll event which affects all cells
    const handleClearAllShifts = () => {
      console.log(`Clearing shift for ${employeeId} on ${date}`);
      setShift(null);
    };
    
    document.addEventListener('shiftAssigned', handleShiftAssigned);
    document.addEventListener('clearAllShifts', handleClearAllShifts);
    
    return () => {
      document.removeEventListener('shiftAssigned', handleShiftAssigned);
      document.addEventListener('clearAllShifts', handleClearAllShifts);
    };
  }, [employeeId, date]);
  
  const handleShiftSelect = useCallback((shiftType: ShiftType) => {
    // On holidays, prevent manual assignments
    if (isHoliday && shiftType === "Arbeit") {
      toast({
        title: "Nicht möglich",
        description: "Keine Zuweisung an Feiertagen möglich.",
        variant: "destructive",
      });
      return;
    }
    
    // Full-time employees can always be assigned to any day
    if (!isFullTime && shiftType !== null && !isPreferredDay && !isFlexible) {
      toast({
        title: "Nicht möglich",
        description: "Dieser Mitarbeiter kann nur an den angegebenen Arbeitstagen arbeiten.",
        variant: "destructive",
      });
      return;
    }
    
    console.log(`Changing shift for ${employeeId} on ${date} from ${shift} to ${shiftType}`);
    
    // Store the current shift before changing it
    const previousShiftType = shift;
    
    // Update local state first
    setShift(shiftType);
    
    // Then dispatch events
    const action = shiftType !== null ? 'add' : 'remove';
    dispatchShiftEvent(employeeId, date, shiftType, action, previousShiftType);
  }, [shift, employeeId, date, isPreferredDay, isFlexible, isFullTime, toast, isHoliday]);
  
  // For holidays, disable the cell and show "Frei" status
  if (isHoliday) {
    return (
      <div className="h-10 flex items-center justify-center bg-red-50 text-sm text-gray-500 border border-gray-200">
        Frei (Feiertag)
      </div>
    );
  }
  
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
