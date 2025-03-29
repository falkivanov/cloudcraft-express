
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { isWorkday } from "../utils/planning/date-utils";

export const useShiftPlanning = () => {
  const [activeTab, setActiveTab] = useState("schedule");
  const [isScheduleFinalized, setIsScheduleFinalized] = useState(false);
  
  // Lade den finalisierten Status aus dem localStorage beim Mounten der Komponente
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
  
  // Funktion zum Finalisieren des Dienstplans
  const handleFinalizeSchedule = useCallback(() => {
    // Prüfen, ob der morgige Tag ein Arbeitstag ist (kein Wochenende und kein Feiertag)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Log für Debugging
    console.log('handleFinalizeSchedule - tomorrow:', tomorrow);
    console.log('handleFinalizeSchedule - isWorkday:', isWorkday(tomorrow));
    
    setIsScheduleFinalized(true);
    
    // Speichere den finalisierten Status im localStorage
    localStorage.setItem('isScheduleFinalized', JSON.stringify(true));
    
    // Zeige Toast-Benachrichtigung
    toast({
      title: "Dienstplan finalisiert",
      description: "Der Dienstplan wurde erfolgreich finalisiert. Sie können jetzt die Fahrzeugzuweisung vornehmen.",
    });
    
    // Optional: Automatisch zur Fahrzeugzuweisung wechseln
    setActiveTab("vehicles");
  }, []);
  
  // Funktion zum Zurücksetzen des finalisierten Status (für Tests oder Entwicklung)
  const resetScheduleFinalized = useCallback(() => {
    setIsScheduleFinalized(false);
    localStorage.setItem('isScheduleFinalized', JSON.stringify(false));
  }, []);
  
  return {
    activeTab,
    setActiveTab,
    isScheduleFinalized,
    setIsScheduleFinalized,
    handleFinalizeSchedule,
    resetScheduleFinalized
  };
};
