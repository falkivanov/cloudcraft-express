
import { useState, useEffect } from "react";
import { Employee } from "@/types/employee";
import { Wave, WaveAssignment } from "../../types/wave-types";
import { DistributionOptions } from "./types";

export const useAssignments = (scheduledEmployees: Employee[], initialWaves: Wave[]) => {
  const [assignments, setAssignments] = useState<WaveAssignment[]>(
    scheduledEmployees.map(emp => ({
      employeeId: emp.id,
      startTime: initialWaves[0]?.time || "11:00",
      waveNumber: 1
    }))
  );

  // Apply wave distribution by creating new assignments
  const applyWaveDistribution = (currentWaves: Wave[], options: DistributionOptions = {}) => {
    // Create a copy of employees to distribute
    const employeesToDistribute = [...scheduledEmployees];
    const newAssignments: WaveAssignment[] = [];
    
    // First, distribute employees according to requested counts
    currentWaves.forEach(wave => {
      // Assign exactly the requested number of employees, no more and no less
      const waveEmployees = employeesToDistribute.splice(0, wave.requestedCount);
      
      waveEmployees.forEach(emp => {
        newAssignments.push({
          employeeId: emp.id,
          startTime: wave.time,
          waveNumber: wave.id
        });
      });
    });
    
    // If there are remaining employees, distribute them evenly across all waves
    if (employeesToDistribute.length > 0) {
      const waveIds = currentWaves.map(w => w.id);
      employeesToDistribute.forEach((emp, index) => {
        // Cyclically distribute across waves
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

  // Update assignments when an employee is moved to a different wave
  const handleEmployeeWaveChange = (employeeId: string, waveId: number, waves: Wave[]) => {
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
  };

  // Get the wave ID for an employee
  const getEmployeeWaveId = (employeeId: string): number => {
    const assignment = assignments.find(a => a.employeeId === employeeId);
    return assignment?.waveNumber || 1;
  };

  // Update assignment times when a wave time changes
  const updateAssignmentTimes = (waveId: number, newTime: string) => {
    const updatedAssignments = assignments.map(a => 
      a.waveNumber === waveId ? { ...a, startTime: newTime } : a
    );
    setAssignments(updatedAssignments);
  };

  // Reassign employees from one wave to another
  const reassignEmployeesFromWave = (fromWaveId: number, toWaveId: number, waves: Wave[]) => {
    const toWave = waves.find(w => w.id === toWaveId);
    if (!toWave) return;

    const updatedAssignments = assignments.map(a => 
      a.waveNumber === fromWaveId 
        ? { ...a, waveNumber: toWaveId, startTime: toWave.time } 
        : a
    );
    
    setAssignments(updatedAssignments);
  };

  // Update assignments when employees change
  useEffect(() => {
    if (scheduledEmployees.length > 0) {
      // Ensure all employees have an assignment
      const currentEmployeeIds = assignments.map(a => a.employeeId);
      const missingEmployees = scheduledEmployees.filter(emp => !currentEmployeeIds.includes(emp.id));
      
      if (missingEmployees.length > 0) {
        const newAssignments = [...assignments];
        
        missingEmployees.forEach(emp => {
          newAssignments.push({
            employeeId: emp.id,
            startTime: initialWaves[0]?.time || "11:00",
            waveNumber: initialWaves[0]?.id || 1
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
    }
  }, [scheduledEmployees, initialWaves]);

  return {
    assignments,
    applyWaveDistribution,
    handleEmployeeWaveChange,
    getEmployeeWaveId,
    updateAssignmentTimes,
    reassignEmployeesFromWave
  };
};
