
import { useState, useEffect } from "react";
import { Employee } from "@/types/employee";
import { Wave, WaveAssignment, WaveEmployeeCount } from "../types/wave-types";

export const useWaveAssignments = (scheduledEmployees: Employee[]) => {
  const [waveCount, setWaveCount] = useState<number>(1);
  const [waves, setWaves] = useState<Wave[]>([
    { id: 1, time: "11:00", requestedCount: scheduledEmployees.length }
  ]);
  const [assignments, setAssignments] = useState<WaveAssignment[]>(
    scheduledEmployees.map(emp => ({
      employeeId: emp.id,
      startTime: "11:00",
      waveNumber: 1
    }))
  );

  // Count employees per wave
  const employeesPerWave: WaveEmployeeCount[] = waves.map(wave => {
    return {
      waveId: wave.id,
      count: assignments.filter(a => a.waveNumber === wave.id).length
    };
  });

  // Handle adding a new wave
  const handleAddWave = () => {
    if (waveCount < 3) {
      const newWaveId = waveCount + 1;
      setWaveCount(newWaveId);
      
      // Add new wave with default requested count of 0
      setWaves([...waves, { id: newWaveId, time: "11:00", requestedCount: 0 }]);
    }
  };

  // Handle removing a wave
  const handleRemoveWave = (waveId: number) => {
    if (waveCount > 1) {
      const filteredWaves = waves.filter(w => w.id !== waveId);
      setWaves(filteredWaves);
      setWaveCount(waveCount - 1);
      
      // Reassign employees from removed wave to first wave
      const updatedAssignments = assignments.map(a => 
        a.waveNumber === waveId ? { ...a, waveNumber: 1, startTime: waves[0].time } : a
      );
      setAssignments(updatedAssignments);
      
      // Redistribute requested counts
      const removedWave = waves.find(w => w.id === waveId);
      if (removedWave) {
        const firstWave = filteredWaves[0];
        filteredWaves[0] = {
          ...firstWave,
          requestedCount: firstWave.requestedCount + removedWave.requestedCount
        };
      }
      
      // Apply the wave distribution
      applyWaveDistribution(filteredWaves);
    }
  };

  // Handle time change for a wave
  const handleWaveTimeChange = (waveId: number, newTime: string) => {
    const updatedWaves = waves.map(w => 
      w.id === waveId ? { ...w, time: newTime } : w
    );
    setWaves(updatedWaves);
    
    // Update all assignments for this wave with the new time
    const updatedAssignments = assignments.map(a => 
      a.waveNumber === waveId ? { ...a, startTime: newTime } : a
    );
    setAssignments(updatedAssignments);
  };

  // Handle changing the requested count for a wave
  const handleRequestedCountChange = (waveId: number, newCount: number) => {
    // Don't allow negative numbers
    if (newCount < 0) newCount = 0;
    
    // Don't allow more than the total number of employees
    if (newCount > scheduledEmployees.length) newCount = scheduledEmployees.length;
    
    const updatedWaves = waves.map(w => 
      w.id === waveId ? { ...w, requestedCount: newCount } : w
    );
    
    // Ensure the total requested count doesn't exceed the total number of employees
    let totalRequestedCount = updatedWaves.reduce((sum, wave) => sum + wave.requestedCount, 0);
    
    if (totalRequestedCount > scheduledEmployees.length) {
      // Adjust other waves to make the total match the employee count
      for (let i = 0; i < updatedWaves.length; i++) {
        if (updatedWaves[i].id !== waveId && updatedWaves[i].requestedCount > 0) {
          const diff = totalRequestedCount - scheduledEmployees.length;
          const newRequestedCount = Math.max(0, updatedWaves[i].requestedCount - diff);
          updatedWaves[i].requestedCount = newRequestedCount;
          totalRequestedCount = updatedWaves.reduce((sum, wave) => sum + wave.requestedCount, 0);
          
          if (totalRequestedCount <= scheduledEmployees.length) break;
        }
      }
    }
    
    setWaves(updatedWaves);
    
    // Wichtig: Hier wird jetzt direkt nach der Änderung der Wellen-Zahlen
    // die Verteilung der Mitarbeiter neu berechnet
    applyWaveDistribution(updatedWaves);
  };

  // Automatically distribute employees based on the requested count for each wave
  const applyWaveDistribution = (currentWaves = waves) => {
    // Create a copy of employees to distribute
    const employeesToDistribute = [...scheduledEmployees];
    const newAssignments: WaveAssignment[] = [];
    
    // First, distribute employees according to requested counts
    currentWaves.forEach(wave => {
      // Exakt die angeforderte Anzahl an Mitarbeitern zuweisen, nicht mehr und nicht weniger
      const waveEmployees = employeesToDistribute.splice(0, wave.requestedCount);
      
      waveEmployees.forEach(emp => {
        newAssignments.push({
          employeeId: emp.id,
          startTime: wave.time,
          waveNumber: wave.id
        });
      });
    });
    
    // Wenn noch Mitarbeiter übrig sind, werden sie gleichmäßig auf alle Wellen verteilt
    if (employeesToDistribute.length > 0) {
      const waveIds = currentWaves.map(w => w.id);
      employeesToDistribute.forEach((emp, index) => {
        // Zyklisch auf die Wellen verteilen
        const waveIndex = index % waveIds.length;
        const waveId = waveIds[waveIndex];
        const waveTime = currentWaves.find(w => w.id === waveId)?.time || "11:00";
        
        newAssignments.push({
          employeeId: emp.id,
          startTime: waveTime,
          waveNumber: waveId
        });
      });
    }
    
    setAssignments(newAssignments);
  };

  // Handle changing an employee's wave assignment manually
  const handleEmployeeWaveChange = (employeeId: string, waveId: number) => {
    const waveTime = waves.find(w => w.id === waveId)?.time || "11:00";
    
    // Get current wave assignment for this employee
    const currentAssignment = assignments.find(a => a.employeeId === employeeId);
    const currentWaveId = currentAssignment?.waveNumber;
    
    if (currentWaveId === waveId) return; // No change needed
    
    const updatedAssignments = assignments.map(a => 
      a.employeeId === employeeId 
        ? { ...a, waveNumber: waveId, startTime: waveTime } 
        : a
    );
    
    setAssignments(updatedAssignments);
    
    // Wir aktualisieren hier NICHT die requestedCount der Wellen,
    // da diese als feste Vorgabe betrachtet werden
  };

  // Helper function to get the wave ID for an employee
  const getEmployeeWaveId = (employeeId: string): number => {
    const assignment = assignments.find(a => a.employeeId === employeeId);
    return assignment?.waveNumber || 1;
  };

  // Update assignments when scheduledEmployees changes
  useEffect(() => {
    if (scheduledEmployees.length > 0 && waves.length > 0) {
      // Ensure all employees have an assignment
      const currentEmployeeIds = assignments.map(a => a.employeeId);
      const missingEmployees = scheduledEmployees.filter(emp => !currentEmployeeIds.includes(emp.id));
      
      if (missingEmployees.length > 0) {
        const newAssignments = [...assignments];
        
        missingEmployees.forEach(emp => {
          newAssignments.push({
            employeeId: emp.id,
            startTime: waves[0].time,
            waveNumber: waves[0].id
          });
        });
        
        setAssignments(newAssignments);
      }
      
      // Check if we have any assignments for employees that no longer exist
      const extraAssignments = assignments.filter(
        a => !scheduledEmployees.some(emp => emp.id === a.employeeId)
      );
      
      if (extraAssignments.length > 0) {
        const updatedAssignments = assignments.filter(
          a => scheduledEmployees.some(emp => emp.id === a.employeeId)
        );
        
        setAssignments(updatedAssignments);
      }
      
      // Update the requestedCount of the first wave if needed
      if (waves.length === 1 && waves[0].requestedCount !== scheduledEmployees.length) {
        setWaves([{ ...waves[0], requestedCount: scheduledEmployees.length }]);
      }
      
      // Wichtig: Wir wenden nach allen Änderungen die Verteilung an
      applyWaveDistribution(waves);
    }
  }, [scheduledEmployees]);

  return {
    waves,
    employeesPerWave,
    assignments,
    handleAddWave,
    handleRemoveWave,
    handleWaveTimeChange,
    handleRequestedCountChange,
    handleEmployeeWaveChange,
    getEmployeeWaveId
  };
};
