
import { useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { toast } from "sonner";
import { generateAssignments } from "../utils/vehicleAssignmentUtils";
import { useVehicleAssignmentStorage } from "./useVehicleAssignmentStorage";
import { useScheduleFinalized } from "./useScheduleFinalized";

export const useVehicleAssignments = (isScheduleFinalized: boolean) => {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const tomorrow = addDays(today, 1);
  
  const yesterdayDateKey = format(yesterday, "yyyy-MM-dd");
  const todayDateKey = format(today, "yyyy-MM-dd");
  const tomorrowDateKey = format(tomorrow, "yyyy-MM-dd");
  
  const { localFinalized } = useScheduleFinalized(isScheduleFinalized);
  
  const { 
    yesterdayAssignments, 
    todayAssignments, 
    tomorrowAssignments, 
    setTomorrowAssignments,
    overrideFinalized, 
    setOverrideFinalized,
    saveAssignmentHistory
  } = useVehicleAssignmentStorage(yesterdayDateKey, todayDateKey, tomorrowDateKey);
  
  const handleAutoAssign = () => {
    const effectivelyFinalized = localFinalized || overrideFinalized;
    
    if (!effectivelyFinalized) {
      toast.error("Dienstplan nicht finalisiert", {
        description: "Um Fahrzeuge zuzuordnen, muss der Dienstplan zuerst abgeschlossen werden."
      });
      return;
    }
    
    const newAssignments = generateAssignments();
    setTomorrowAssignments(newAssignments);
    
    const formattedTomorrow = format(tomorrow, "dd.MM.yyyy");
    toast.success(`${Object.keys(newAssignments).length} Fahrzeuge für ${formattedTomorrow} automatisch zugewiesen`, {
      description: "Überprüfen Sie die Zuordnungen und speichern Sie diese bei Bedarf."
    });
  };
  
  const handleSaveAssignments = () => {
    const effectivelyFinalized = localFinalized || overrideFinalized;
    
    if (!effectivelyFinalized) {
      toast.error("Dienstplan nicht finalisiert", {
        description: "Um Fahrzeugzuordnungen zu speichern, muss der Dienstplan zuerst abgeschlossen werden."
      });
      return;
    }
    
    if (Object.keys(tomorrowAssignments).length === 0) {
      toast.warning("Keine Zuordnungen vorhanden", {
        description: "Bitte führen Sie zuerst eine Auto-Zuordnung durch."
      });
      return;
    }
    
    // Save the assignment history to localStorage
    const saveSuccess = saveAssignmentHistory(tomorrowAssignments, tomorrowDateKey);
    
    if (saveSuccess) {
      const formattedTomorrow = format(tomorrow, "dd.MM.yyyy");
      toast.success(`Fahrzeugzuordnungen für ${formattedTomorrow} wurden gespeichert!`);
    } else {
      toast.error("Fehler beim Speichern", {
        description: "Die Zuordnungen konnten nicht gespeichert werden."
      });
    }
  };

  return {
    yesterdayAssignments,
    todayAssignments,
    tomorrowAssignments,
    overrideFinalized,
    setOverrideFinalized,
    effectivelyFinalized: localFinalized || overrideFinalized,
    handleAutoAssign,
    handleSaveAssignments,
    tomorrowDateKey,
    yesterdayDateKey,
    todayDateKey
  };
};
