
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Employee } from "@/types/employee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StartTimeWaves from "./StartTimeWaves";
import { WaveAssignment } from "./types/wave-types";
import { Clock, Users, AlertTriangle } from "lucide-react";
import { groupEmployeesByWave, getSortedWaves, isSingleWave } from "./utils/wave-utils";
import WaveEmployeeDisplay from "./wave-display/WaveEmployeeDisplay";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [storageError, setStorageError] = useState<string | null>(null);
  
  // Lade gespeicherte Wellenzuweisungen aus dem localStorage
  useEffect(() => {
    const loadWaveAssignments = () => {
      try {
        const key = `waveAssignments-${dateKey}`;
        const savedWaveAssignments = localStorage.getItem(key);
        
        if (savedWaveAssignments) {
          const parsedWaveAssignments = JSON.parse(savedWaveAssignments);
          
          // Validate the parsed data structure
          if (Array.isArray(parsedWaveAssignments) && 
              parsedWaveAssignments.every(assignment => 
                typeof assignment === 'object' && 
                assignment !== null &&
                'employeeId' in assignment && 
                'startTime' in assignment && 
                'waveNumber' in assignment)) {
            console.log(`Loaded wave assignments for ${dateKey}:`, parsedWaveAssignments.length);
            setWaveAssignments(parsedWaveAssignments);
            setStorageError(null);
          } else {
            throw new Error('Invalid data structure for wave assignments');
          }
        } else {
          // Initialisiere mit Standardwerten, wenn keine gespeicherten Daten vorhanden sind
          const defaultAssignments = scheduledEmployees.map(emp => ({
            employeeId: emp.id,
            startTime: "11:00",
            waveNumber: 1
          }));
          setWaveAssignments(defaultAssignments);
          setStorageError(null);
        }
      } catch (error) {
        console.error('Error loading wave assignments from localStorage:', error);
        setStorageError('Fehler beim Laden der Wellenzuweisungen. Standardwerte werden verwendet.');
        
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
      setStorageError(null);
    } catch (error) {
      console.error('Error saving wave assignments to localStorage:', error);
      setStorageError('Fehler beim Speichern der Wellenzuweisungen. Änderungen werden nach dem Neuladen der Seite verloren gehen.');
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

      {storageError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Speicherproblem</AlertTitle>
          <AlertDescription>{storageError}</AlertDescription>
        </Alert>
      )}

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
