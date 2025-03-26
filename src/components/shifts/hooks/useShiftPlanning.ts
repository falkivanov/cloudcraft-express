
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useShiftPlanning = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("schedule");
  const [isScheduleFinalized, setIsScheduleFinalized] = useState(false);
  
  // Lade den Status des finalisierten Dienstplans aus dem localStorage
  useEffect(() => {
    try {
      const savedIsScheduleFinalized = localStorage.getItem('isScheduleFinalized');
      if (savedIsScheduleFinalized) {
        setIsScheduleFinalized(JSON.parse(savedIsScheduleFinalized));
        console.log('Loaded schedule finalized status:', JSON.parse(savedIsScheduleFinalized));
      }
    } catch (error) {
      console.error('Error loading schedule finalized status from localStorage:', error);
    }
  }, []);
  
  // Speichere den Status des finalisierten Dienstplans im localStorage
  useEffect(() => {
    try {
      localStorage.setItem('isScheduleFinalized', JSON.stringify(isScheduleFinalized));
      console.log('Saved schedule finalized status:', isScheduleFinalized);
    } catch (error) {
      console.error('Error saving schedule finalized status to localStorage:', error);
    }
  }, [isScheduleFinalized]);
  
  const handleFinalizeSchedule = () => {
    // In a real app, this would save the schedule to the backend
    setIsScheduleFinalized(true);
    toast({
      title: "Dienstplan finalisiert",
      description: "Sie können jetzt mit der Fahrzeugzuordnung fortfahren.",
    });
    setActiveTab("vehicles");
  };

  return {
    activeTab,
    setActiveTab,
    isScheduleFinalized,
    handleFinalizeSchedule
  };
};
