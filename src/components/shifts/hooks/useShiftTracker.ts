import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ShiftAssignment } from "@/types/shift";
import { ShiftType } from "../utils/shift-utils";

export const useShiftTracker = (weekDays: Date[]) => {
  // Get date string in yyyy-MM-dd format
  const formatDateKey = (date: Date) => format(date, "yyyy-MM-dd");
  
  // Initialize shifts map to track all current assignments
  const [shiftsMap, setShiftsMap] = useState<Map<string, ShiftAssignment>>(new Map());
  
  // Track scheduled employees (only those with shiftType "Arbeit")
  const [scheduledEmployees, setScheduledEmployees] = useState<Record<string, number>>({});
  
  // Load saved shift assignments
  useEffect(() => {
    const loadShiftsFromStorage = () => {
      try {
        // Check if a timestamp exists to confirm data validity
        const dataTimestamp = localStorage.getItem('dataTimestamp');
        
        // Load data from localStorage
        const savedShifts = localStorage.getItem('shiftsMap');
        if (savedShifts) {
          // Restore map from JSON string
          const shiftsObject = JSON.parse(savedShifts);
          const newMap = new Map<string, ShiftAssignment>();
          
          if (typeof shiftsObject === 'object' && shiftsObject !== null) {
            Object.entries(shiftsObject).forEach(([key, value]) => {
              if (value && typeof value === 'object' && 'employeeId' in value && 'date' in value && 'shiftType' in value) {
                newMap.set(key, value as ShiftAssignment);
              } else {
                console.warn(`Invalid shift assignment found for key ${key}, skipping`, value);
              }
            });
            console.log('Loaded shifts from localStorage:', newMap.size);
            setShiftsMap(newMap);
          } else {
            console.error('Invalid shifts data structure in localStorage');
            // Keep empty map if data is invalid
          }
        } else {
          console.log('No saved shifts found in localStorage, starting with empty map');
        }
      } catch (error) {
        console.error('Error loading shifts from localStorage:', error);
        // Keep initial empty map if data is corrupted
      }
    };
    
    loadShiftsFromStorage();
  }, []);

  // Save shift assignments to localStorage whenever they change
  useEffect(() => {
    const saveShiftsToStorage = () => {
      if (shiftsMap.size > 0) {
        try {
          // Convert Map to a storable object
          const shiftsObject: Record<string, ShiftAssignment> = {};
          shiftsMap.forEach((value, key) => {
            shiftsObject[key] = value;
          });
          localStorage.setItem('shiftsMap', JSON.stringify(shiftsObject));
          
          // Also set a timestamp for data verification
          localStorage.setItem('dataTimestamp', Date.now().toString());
          console.log('Auto-saved shifts to localStorage:', Object.keys(shiftsObject).length);
        } catch (error) {
          console.error('Error saving shifts to localStorage:', error);
          // Notify about potential data loss
          if (shiftsMap.size > 0) {
            console.warn('Shift assignments might not persist after page refresh due to storage error');
          }
        }
      }
    };
    
    // Save immediately when shifts change
    saveShiftsToStorage();
    
    // Also set up an interval to save periodically (every 30 seconds)
    const saveInterval = setInterval(saveShiftsToStorage, 30000);
    
    return () => {
      clearInterval(saveInterval);
      // Save one last time when component unmounts
      saveShiftsToStorage();
    };
  }, [shiftsMap]);
  
  // Also add a beforeunload handler to save data when the page is about to unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        // Convert Map to a storable object
        const shiftsObject: Record<string, ShiftAssignment> = {};
        shiftsMap.forEach((value, key) => {
          shiftsObject[key] = value;
        });
        
        // Set a timestamp for data verification
        localStorage.setItem('dataTimestamp', Date.now().toString());
        localStorage.setItem('shiftsMap', JSON.stringify(shiftsObject));
        console.log('Saved shifts to localStorage before unload:', Object.keys(shiftsObject).length);
      } catch (error) {
        console.error('Error saving shifts to localStorage before unload:', error);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shiftsMap]);

  // Clear only regular shifts (preserves special shifts like Termin, Urlaub, Krank)
  const clearShifts = useCallback(() => {
    setShiftsMap(prevMap => {
      const newMap = new Map<string, ShiftAssignment>();
      
      // Keep all special shifts and Frei shifts will be cleared
      prevMap.forEach((shift, key) => {
        if (shift.shiftType === "Termin" || shift.shiftType === "Urlaub" || shift.shiftType === "Krank") {
          newMap.set(key, shift);
        }
      });
      
      return newMap;
    });
    
    // Reset scheduled counts
    const initialScheduled: Record<string, number> = {};
    weekDays.forEach(day => {
      initialScheduled[formatDateKey(day)] = 0;
    });
    setScheduledEmployees(initialScheduled);
  }, [weekDays]);
  
  // Function to refresh the counts when needed (e.g., when changing weeks)
  const refreshScheduledCounts = useCallback(() => {
    const initialScheduled: Record<string, number> = {};
    weekDays.forEach(day => {
      initialScheduled[formatDateKey(day)] = 0;
    });
    return initialScheduled;
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
  
  return {
    shiftsMap,
    scheduledEmployees,
    formatDateKey,
    clearShifts,
    refreshScheduledCounts
  };
};
