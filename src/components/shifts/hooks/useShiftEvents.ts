
import { useEffect } from "react";
import { ShiftAssignment } from "@/types/shift";

/**
 * Hook for handling shift assignment events
 */
export const useShiftEvents = (
  setShiftsMap: React.Dispatch<React.SetStateAction<Map<string, ShiftAssignment>>>
) => {
  // Listen for shift assignments
  useEffect(() => {
    const handleShiftAssigned = (event: Event) => {
      try {
        const customEvent = event as CustomEvent;
        const { assignment, action } = customEvent.detail;
        
        if (!assignment || !assignment.date || !assignment.employeeId) {
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
      } catch (error) {
        console.error('Error handling shift assignment event:', error);
      }
    };
    
    document.addEventListener('shiftAssigned', handleShiftAssigned);
    
    return () => {
      document.removeEventListener('shiftAssigned', handleShiftAssigned);
    };
  }, [setShiftsMap]);
};
