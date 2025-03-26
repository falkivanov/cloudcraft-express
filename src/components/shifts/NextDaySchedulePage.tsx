
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Employee } from "@/types/employee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StartTimeWaves from "./StartTimeWaves";
import { WaveAssignment } from "./types/wave-types";
import { Clock, Users } from "lucide-react";
import { groupEmployeesByWave, getSortedWaves, isSingleWave } from "./utils/wave-utils";
import WaveEmployeeDisplay from "./wave-display/WaveEmployeeDisplay";

interface NextDaySchedulePageProps {
  scheduledEmployees: Employee[];
  date: Date;
}

const NextDaySchedulePage: React.FC<NextDaySchedulePageProps> = ({ 
  scheduledEmployees, 
  date
}) => {
  const formattedDate = format(date, "EEEE, dd.MM.yyyy", { locale: de });
  const dateKey = format(date, "yyyy-MM-dd");
  
  const [waveAssignments, setWaveAssignments] = useState<WaveAssignment[]>([]);
  
  // Lade gespeicherte Wellenzuweisungen aus dem localStorage
  useEffect(() => {
    const loadWaveAssignments = () => {
      try {
        const key = `waveAssignments-${dateKey}`;
        const savedWaveAssignments = localStorage.getItem(key);
        
        if (savedWaveAssignments) {
          const parsedWaveAssignments = JSON.parse(savedWaveAssignments);
          console.log(`Loaded wave assignments for ${dateKey}:`, parsedWaveAssignments.length);
          setWaveAssignments(parsedWaveAssignments);
        } else {
          // Initialisiere mit Standardwerten, wenn keine gespeicherten Daten vorhanden sind
          const defaultAssignments = scheduledEmployees.map(emp => ({
            employeeId: emp.id,
            startTime: "11:00",
            waveNumber: 1
          }));
          setWaveAssignments(defaultAssignments);
        }
      } catch (error) {
        console.error('Error loading wave assignments from localStorage:', error);
        // Fallback zu Standardwerten
        const defaultAssignments = scheduledEmployees.map(emp => ({
          employeeId: emp.id,
          startTime: "11:00",
          waveNumber: 1
        }));
        setWaveAssignments(defaultAssignments);
      }
    };
    
    loadWaveAssignments();
  }, [scheduledEmployees, dateKey]);
  
  // Group employees by wave using our utility functions
  const employeesByWave = groupEmployeesByWave(waveAssignments, scheduledEmployees);
  const sortedWaves = getSortedWaves(employeesByWave);
  const singleWave = isSingleWave(sortedWaves);
  
  // Handle wave assignments
  const handleAssignWaves = (assignments: WaveAssignment[]) => {
    setWaveAssignments(assignments);
    
    // Speichere Wellenzuweisungen im localStorage
    try {
      const key = `waveAssignments-${dateKey}`;
      localStorage.setItem(key, JSON.stringify(assignments));
      console.log(`Saved wave assignments for ${dateKey}:`, assignments.length);
    } catch (error) {
      console.error('Error saving wave assignments to localStorage:', error);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Einsatzplan für {formattedDate}
        </h2>
        <div className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
          {scheduledEmployees.length} Mitarbeiter eingeplant
        </div>
      </div>

      {scheduledEmployees.length === 0 ? (
        <div className="bg-muted rounded-lg p-8 text-center">
          <p className="text-muted-foreground text-lg">Keine Mitarbeiter für diesen Tag eingeplant.</p>
        </div>
      ) : (
        <>
          <StartTimeWaves 
            scheduledEmployees={scheduledEmployees}
            onAssignWaves={handleAssignWaves}
            initialAssignments={waveAssignments}
          />
          
          <WaveEmployeeDisplay 
            sortedWaves={sortedWaves}
            isSingleWave={singleWave}
          />
        </>
      )}
    </div>
  );
};

export default NextDaySchedulePage;
