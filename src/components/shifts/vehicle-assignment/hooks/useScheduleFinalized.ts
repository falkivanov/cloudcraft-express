
import { useState, useEffect } from "react";

export const useScheduleFinalized = (isScheduleFinalized: boolean) => {
  const [localFinalized, setLocalFinalized] = useState(isScheduleFinalized);
  
  // Check for changes in isScheduleFinalized prop
  useEffect(() => {
    setLocalFinalized(isScheduleFinalized);
    console.log("isScheduleFinalized prop changed:", isScheduleFinalized);
  }, [isScheduleFinalized]);
  
  // Save localFinalized changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('isScheduleFinalized', JSON.stringify(localFinalized));
      console.log("Saved schedule finalized status to localStorage:", localFinalized);
    } catch (error) {
      console.error('Error saving schedule finalized status to localStorage:', error);
    }
  }, [localFinalized]);
  
  // Listen for storage events that might update the finalized status
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedIsScheduleFinalized = localStorage.getItem('isScheduleFinalized');
        if (savedIsScheduleFinalized) {
          const newValue = JSON.parse(savedIsScheduleFinalized);
          setLocalFinalized(newValue);
          console.log("Schedule finalized status updated from storage:", newValue);
        }
      } catch (error) {
        console.error('Error reading schedule finalized status from localStorage:', error);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom dayFinalized events
    const handleDayFinalized = () => {
      setLocalFinalized(true);
      console.log("Day finalized event detected, updating local finalized state");
    };
    
    window.addEventListener('dayFinalized', handleDayFinalized);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dayFinalized', handleDayFinalized);
    };
  }, []);

  return {
    localFinalized,
    setLocalFinalized
  };
};
