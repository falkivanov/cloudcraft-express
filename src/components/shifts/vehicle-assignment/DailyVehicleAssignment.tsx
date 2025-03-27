
import React, { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";
import { initialEmployees } from "@/data/sampleEmployeeData";
import { generateAssignments, activeVehicles } from "./utils/vehicleAssignmentUtils";
import VehicleAssignmentControls from "./components/VehicleAssignmentControls";
import VehicleAssignmentLegend from "./components/VehicleAssignmentLegend";
import VehicleAssignmentTable from "./components/VehicleAssignmentTable";

interface DailyVehicleAssignmentProps {
  isScheduleFinalized: boolean;
}

const DailyVehicleAssignment: React.FC<DailyVehicleAssignmentProps> = ({ isScheduleFinalized }) => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  
  const formattedTomorrow = format(tomorrow, "dd.MM.yyyy", { locale: de });
  const tomorrowDateKey = format(tomorrow, "yyyy-MM-dd");
  const todayDateKey = format(today, "yyyy-MM-dd");
  
  const [todayAssignments, setTodayAssignments] = useState<Record<string, string>>({});
  const [tomorrowAssignments, setTomorrowAssignments] = useState<Record<string, string>>({});
  const [overrideFinalized, setOverrideFinalized] = useState(false);
  const [localFinalized, setLocalFinalized] = useState(isScheduleFinalized);
  
  // Check for changes in isScheduleFinalized prop
  useEffect(() => {
    setLocalFinalized(isScheduleFinalized);
    console.log("isScheduleFinalized prop changed:", isScheduleFinalized);
  }, [isScheduleFinalized]);
  
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
  
  const effectivelyFinalized = localFinalized || overrideFinalized;
  
  // Lade gespeicherte Zuordnungen aus dem localStorage
  useEffect(() => {
    try {
      const savedTodayAssignments = localStorage.getItem(`vehicleAssignments-${todayDateKey}`);
      const savedTomorrowAssignments = localStorage.getItem(`vehicleAssignments-${tomorrowDateKey}`);
      const savedOverrideFinalized = localStorage.getItem('overrideFinalized');
      
      if (savedOverrideFinalized) {
        setOverrideFinalized(JSON.parse(savedOverrideFinalized));
      }
      
      if (savedTodayAssignments) {
        setTodayAssignments(JSON.parse(savedTodayAssignments));
      } else {
        // Fallback auf Mock-Daten nur wenn keine gespeicherten Daten vorhanden sind
        const mockTodayAssignments: Record<string, string> = {
          "1": "1",
          "2": "3",
          "3": "2",
          "6": "5",
          "9": "7",
        };
        setTodayAssignments(mockTodayAssignments);
        
        // Speichere die Mock-Daten, damit sie beim nächsten Mal verfügbar sind
        localStorage.setItem(`vehicleAssignments-${todayDateKey}`, JSON.stringify(mockTodayAssignments));
      }
      
      if (savedTomorrowAssignments) {
        setTomorrowAssignments(JSON.parse(savedTomorrowAssignments));
      }
    } catch (error) {
      console.error('Error loading vehicle assignments from localStorage:', error);
    }
  }, [todayDateKey, tomorrowDateKey]);
  
  // Speichere Zuordnungen im localStorage, wenn sie sich ändern
  useEffect(() => {
    try {
      localStorage.setItem(`vehicleAssignments-${todayDateKey}`, JSON.stringify(todayAssignments));
    } catch (error) {
      console.error('Error saving today vehicle assignments to localStorage:', error);
    }
  }, [todayAssignments, todayDateKey]);
  
  useEffect(() => {
    try {
      localStorage.setItem(`vehicleAssignments-${tomorrowDateKey}`, JSON.stringify(tomorrowAssignments));
    } catch (error) {
      console.error('Error saving tomorrow vehicle assignments to localStorage:', error);
    }
  }, [tomorrowAssignments, tomorrowDateKey]);
  
  // Speichere override-Status
  useEffect(() => {
    try {
      localStorage.setItem('overrideFinalized', JSON.stringify(overrideFinalized));
    } catch (error) {
      console.error('Error saving override finalized status to localStorage:', error);
    }
  }, [overrideFinalized]);
  
  const handleAutoAssign = () => {
    if (!effectivelyFinalized) {
      toast.error("Dienstplan nicht finalisiert", {
        description: "Um Fahrzeuge zuzuordnen, muss der Dienstplan zuerst abgeschlossen werden."
      });
      return;
    }
    
    const newAssignments = generateAssignments();
    setTomorrowAssignments(newAssignments);
    
    toast.success(`${Object.keys(newAssignments).length} Fahrzeuge für ${formattedTomorrow} automatisch zugewiesen`, {
      description: "Überprüfen Sie die Zuordnungen und speichern Sie diese bei Bedarf."
    });
  };
  
  const handleSaveAssignments = () => {
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
    
    const activeVehiclesList = activeVehicles();
    
    const savedAssignments = Object.entries(tomorrowAssignments).map(([vehicleId, employeeId]) => {
      const vehicle = activeVehiclesList.find(v => v.id === vehicleId);
      const employee = initialEmployees.find(e => e.id === employeeId);
      return {
        id: `${vehicleId}-${employeeId}-${tomorrowDateKey}`,
        vehicleId,
        vehicleInfo: `${vehicle?.brand} ${vehicle?.model} (${vehicle?.licensePlate})`,
        employeeId,
        employeeName: employee?.name || "",
        date: tomorrowDateKey,
        assignedAt: new Date().toISOString(),
        assignedBy: "Admin"
      };
    });
    
    // Speichere die Zuordnungshistorie im localStorage
    try {
      const existingHistory = localStorage.getItem('vehicleAssignmentHistory');
      const historyArray = existingHistory ? JSON.parse(existingHistory) : [];
      const updatedHistory = [...historyArray, ...savedAssignments];
      localStorage.setItem('vehicleAssignmentHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving vehicle assignment history to localStorage:', error);
    }
    
    console.log("Saved assignments for tomorrow:", savedAssignments);
    toast.success(`Fahrzeugzuordnungen für ${formattedTomorrow} wurden gespeichert!`);
  };
  
  return (
    <div className="space-y-6 w-full">
      <VehicleAssignmentControls
        isScheduleFinalized={effectivelyFinalized}
        overrideFinalized={overrideFinalized}
        setOverrideFinalized={setOverrideFinalized}
        tomorrowAssignments={tomorrowAssignments}
        onAutoAssign={handleAutoAssign}
        onSaveAssignments={handleSaveAssignments}
      />
      
      <VehicleAssignmentLegend />
      
      <VehicleAssignmentTable
        todayAssignments={todayAssignments}
        tomorrowAssignments={tomorrowAssignments}
      />
    </div>
  );
};

export default DailyVehicleAssignment;
