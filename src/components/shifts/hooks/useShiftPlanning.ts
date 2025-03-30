import { useState, useEffect } from "react";

export const useShiftPlanning = () => {
  // Only 'schedule' and 'vehicles' tabs remain
  const [activeTab, setActiveTab] = useState<string>("schedule");
  const [isScheduleFinalized, setIsScheduleFinalized] = useState<boolean>(false);
  
  // Load the schedule finalized status from localStorage when component mounts
  useEffect(() => {
    try {
      const savedIsScheduleFinalized = localStorage.getItem('isScheduleFinalized');
      if (savedIsScheduleFinalized) {
        setIsScheduleFinalized(JSON.parse(savedIsScheduleFinalized));
      }
    } catch (error) {
      console.error('Error loading schedule finalized status from localStorage:', error);
    }
  }, []);
  
  // Handle finalizing the schedule
  const handleFinalizeSchedule = () => {
    setIsScheduleFinalized(true);
    localStorage.setItem('isScheduleFinalized', JSON.stringify(true));
    
    // Dispatch an event to notify other components
    const event = new CustomEvent('scheduleFinalized', {
      detail: { isFinalized: true }
    });
    window.dispatchEvent(event);
    
    // Switch to the vehicles tab
    setActiveTab("vehicles");
  };
  
  return {
    activeTab,
    setActiveTab,
    isScheduleFinalized,
    handleFinalizeSchedule
  };
};
