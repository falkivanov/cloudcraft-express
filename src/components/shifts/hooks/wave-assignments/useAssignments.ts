
import { useState, useCallback } from "react";
import { WaveAssignment } from "../../types/wave-types";
import { Employee } from "@/types/employee";
import { Wave } from "../../types/wave-types";

export const useAssignments = (
  initialData: WaveAssignment[] | Employee[]
) => {
  const [assignments, setAssignments] = useState<WaveAssignment[]>(() => {
    // If initialData contains WaveAssignments, use them directly
    if (initialData.length > 0 && 'employeeId' in initialData[0]) {
      return initialData as WaveAssignment[];
    }
    
    // Otherwise, assume initialData is Employee[] and create default assignments
    return (initialData as Employee[]).map(emp => ({
      employeeId: emp.id,
      startTime: "11:00",
      waveNumber: 1
    }));
  });
  
  const getEmployeeWaveId = useCallback((employeeId: string) => {
    const assignment = assignments.find(a => a.employeeId === employeeId);
    return assignment?.waveNumber || 1;
  }, [assignments]);
  
  const updateEmployeeWaveId = useCallback((
    employeeId: string, 
    newWaveId: number,
    startTime: string
  ) => {
    setAssignments(prev => 
      prev.map(a => 
        a.employeeId === employeeId
          ? { ...a, waveNumber: newWaveId, startTime }
          : a
      )
    );
  }, []);

  // Add missing functions that are needed by other hooks
  const handleEmployeeWaveChange = useCallback((
    employeeId: string, 
    waveId: number, 
    waves: Wave[]
  ) => {
    const waveData = waves.find(w => w.id === waveId);
    if (waveData) {
      updateEmployeeWaveId(employeeId, waveId, waveData.time);
    }
  }, [updateEmployeeWaveId]);

  const updateAssignmentTimes = useCallback((waveId: number, newTime: string) => {
    setAssignments(prev => 
      prev.map(a => 
        a.waveNumber === waveId
          ? { ...a, startTime: newTime }
          : a
      )
    );
  }, []);

  const reassignEmployeesFromWave = useCallback((sourceWaveId: number, targetWaveId: number, waves: Wave[]) => {
    const targetWave = waves.find(w => w.id === targetWaveId);
    if (!targetWave) return;

    setAssignments(prev => 
      prev.map(a => 
        a.waveNumber === sourceWaveId
          ? { ...a, waveNumber: targetWaveId, startTime: targetWave.time }
          : a
      )
    );
  }, []);

  const applyWaveDistribution = useCallback((waves: Wave[]) => {
    const employeeIds = assignments.map(a => a.employeeId);
    const newAssignments: WaveAssignment[] = [];
    
    // Distribute employees across waves based on requested counts
    let employeeIndex = 0;
    
    for (const wave of waves) {
      // For each wave, assign the requested number of employees
      for (let i = 0; i < wave.requestedCount && employeeIndex < employeeIds.length; i++) {
        newAssignments.push({
          employeeId: employeeIds[employeeIndex],
          startTime: wave.time,
          waveNumber: wave.id
        });
        employeeIndex++;
      }
    }
    
    // If any employees left, assign them to the last wave
    if (employeeIndex < employeeIds.length && waves.length > 0) {
      const lastWave = waves[waves.length - 1];
      while (employeeIndex < employeeIds.length) {
        newAssignments.push({
          employeeId: employeeIds[employeeIndex],
          startTime: lastWave.time,
          waveNumber: lastWave.id
        });
        employeeIndex++;
      }
    }
    
    setAssignments(newAssignments);
  }, [assignments]);
  
  return {
    assignments,
    setAssignments,
    getEmployeeWaveId,
    updateEmployeeWaveId,
    handleEmployeeWaveChange,
    updateAssignmentTimes,
    reassignEmployeesFromWave,
    applyWaveDistribution
  };
};
