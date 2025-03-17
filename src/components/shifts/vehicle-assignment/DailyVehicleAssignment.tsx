
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
  
  const [todayAssignments, setTodayAssignments] = useState<Record<string, string>>({});
  const [tomorrowAssignments, setTomorrowAssignments] = useState<Record<string, string>>({});
  const [overrideFinalized, setOverrideFinalized] = useState(false);
  
  const effectivelyFinalized = isScheduleFinalized || overrideFinalized;
  
  useEffect(() => {
    const mockTodayAssignments: Record<string, string> = {
      "1": "1",
      "2": "3",
      "3": "2",
      "6": "5",
      "9": "7",
    };
    setTodayAssignments(mockTodayAssignments);
  }, []);
  
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
    
    const savedAssignments = Object.entries(tomorrowAssignments).map(([vehicleId, employeeId]) => {
      const vehicle = activeVehicles.find(v => v.id === vehicleId);
      const employee = initialEmployees.find(e => e.id === employeeId);
      return {
        id: `${vehicleId}-${employeeId}-${format(tomorrow, "yyyy-MM-dd")}`,
        vehicleId,
        vehicleInfo: `${vehicle?.brand} ${vehicle?.model} (${vehicle?.licensePlate})`,
        employeeId,
        employeeName: employee?.name || "",
        date: format(tomorrow, "yyyy-MM-dd"),
        assignedAt: new Date().toISOString(),
        assignedBy: "Admin"
      };
    });
    
    console.log("Saved assignments for tomorrow:", savedAssignments);
    toast.success(`Fahrzeugzuordnungen für ${formattedTomorrow} wurden gespeichert!`);
  };
  
  return (
    <div className="space-y-6">
      <VehicleAssignmentControls
        isScheduleFinalized={isScheduleFinalized}
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
