
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useShiftPlanning = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("schedule");
  const [isScheduleFinalized, setIsScheduleFinalized] = useState(false);
  
  // Lade den Status des finalisierten Dienstplans aus dem localStorage
  useEffect(() => {
    const loadFinalizedStatus = () => {
      try {
        const savedIsScheduleFinalized = localStorage.getItem('isScheduleFinalized');
        if (savedIsScheduleFinalized) {
          const parsedValue = JSON.parse(savedIsScheduleFinalized);
          // Ensure boolean value
          setIsScheduleFinalized(!!parsedValue);
          console.log('Loaded schedule finalized status:', !!parsedValue);
        } else {
          console.log('No schedule finalized status found in localStorage');
        }
      } catch (error) {
        console.error('Error loading schedule finalized status from localStorage:', error);
        // Default to false (not finalized) in case of error
        setIsScheduleFinalized(false);
      }
    };
    
    loadFinalizedStatus();
  }, []);
  
  // Speichere den Status des finalisierten Dienstplans im localStorage
  useEffect(() => {
    try {
      localStorage.setItem('isScheduleFinalized', JSON.stringify(isScheduleFinalized));
      console.log('Saved schedule finalized status:', isScheduleFinalized);
    } catch (error) {
      console.error('Error saving schedule finalized status to localStorage:', error);
      if (isScheduleFinalized) {
        toast({
          title: "Speicherfehler",
          description: "Der Finalisierungsstatus konnte nicht gespeichert werden. Versuchen Sie es später erneut.",
          variant: "destructive",
        });
      }
    }
  }, [isScheduleFinalized, toast]);
  
  const handleFinalizeSchedule = () => {
    // In a real app, this would save the schedule to the backend
    setIsScheduleFinalized(true);
    
    // Dispatch storage event to notify other components
    try {
      // Dispatch a custom event to notify other components
      const customEvent = new CustomEvent('scheduleFinalized', { 
        detail: { finalized: true }
      });
      window.dispatchEvent(customEvent);
      
      toast({
        title: "Dienstplan finalisiert",
        description: "Sie können jetzt mit der Fahrzeugzuordnung fortfahren.",
      });
      
      setActiveTab("vehicles");
    } catch (error) {
      console.error('Error dispatching schedule finalized event:', error);
      toast({
        title: "Fehler beim Finalisieren",
        description: "Der Dienstplan wurde finalisiert, aber andere Komponenten wurden möglicherweise nicht benachrichtigt.",
        variant: "destructive",
      });
    }
  };

  return {
    activeTab,
    setActiveTab,
    isScheduleFinalized,
    handleFinalizeSchedule
  };
};
