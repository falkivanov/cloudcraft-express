
import { useState, useEffect, useMemo } from "react";
import { Employee } from "@/types/employee";
import { WaveAssignment } from "../types/wave-types";
import { useWaveState } from "./wave-assignments/useWaveState";
import { useEmployeesPerWave } from "./wave-assignments/useEmployeesPerWave";
import { useAssignments } from "./wave-assignments/useAssignments";

export const useWaveAssignments = (
  scheduledEmployees: Employee[], 
  initialAssignments: WaveAssignment[] = []
) => {
  // Initialize wave state
  const {
    waves,
    addWave,
    removeWave,
    updateWaveTime,
    updateRequestedCount
  } = useWaveState();
  
  // Initialize assignments with either initial assignments or default assignments
  const {
    assignments,
    setAssignments,
    getEmployeeWaveId,
    updateEmployeeWaveId
  } = useAssignments(initialAssignments.length > 0 ? initialAssignments : scheduledEmployees);
  
  // Track how many employees are in each wave
  const employeesPerWave = useEmployeesPerWave(assignments, waves);
  
  // Update assignments if employee list changes
  useEffect(() => {
    if (initialAssignments.length > 0) {
      // Wenn wir initialAssignments haben, verwende diese
      setAssignments(initialAssignments);
    } else if (!assignments.length && scheduledEmployees.length) {
      // Wenn keine Zuweisungen vorhanden sind, aber es Mitarbeiter gibt, weise alle der ersten Welle zu
      const newAssignments = scheduledEmployees.map(emp => ({
        employeeId: emp.id,
        startTime: waves[0]?.startTime || "11:00",
        waveNumber: 1
      }));
      setAssignments(newAssignments);
    }
  }, [scheduledEmployees, initialAssignments, setAssignments, waves]);
  
  // Handler functions
  const handleAddWave = () => {
    addWave();
  };
  
  const handleRemoveWave = (waveId: number) => {
    // Get the wave before the one to remove (or the first if removing first wave)
    const targetWaveId = waveId > 1 ? waveId - 1 : 1;
    
    // Move all employees from removed wave to target wave
    const updatedAssignments = assignments.map(assign => {
      if (assign.waveNumber === waveId) {
        return {
          ...assign,
          waveNumber: targetWaveId
        };
      }
      return assign;
    });
    
    // Update the assignments
    setAssignments(updatedAssignments);
    
    // Finally remove the wave
    removeWave(waveId);
  };
  
  const handleWaveTimeChange = (waveId: number, newTime: string) => {
    updateWaveTime(waveId, newTime);
    
    // Also update all assignments in this wave
    const updatedAssignments = assignments.map(assign => {
      if (assign.waveNumber === waveId) {
        return {
          ...assign,
          startTime: newTime
        };
      }
      return assign;
    });
    
    setAssignments(updatedAssignments);
  };
  
  const handleRequestedCountChange = (waveId: number, newCount: number) => {
    updateRequestedCount(waveId, newCount);
  };
  
  const handleEmployeeWaveChange = (employeeId: string, newWaveId: number) => {
    const waveData = waves.find(w => w.id === newWaveId);
    
    if (waveData) {
      updateEmployeeWaveId(employeeId, newWaveId, waveData.startTime);
    }
  };
  
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
