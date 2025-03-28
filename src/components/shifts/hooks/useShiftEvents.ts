
import { useEffect } from "react";
import { ShiftAssignment } from "@/types/shift";

/**
 * Hook to listen for shift assignment events and update the shiftsMap
 */
export const useShiftEvents = (
  setShiftsMap: React.Dispatch<React.SetStateAction<Map<string, ShiftAssignment>>>
) => {
  // Listen for shift assignment events
  useEffect(() => {
    const handleShiftAssigned = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { assignment, action } = customEvent.detail;
      
      console.log(`Shift ${action} event received:`, assignment);
      
      setShiftsMap(prev => {
        const newMap = new Map(prev);
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
  }, [setShiftsMap]);
};
