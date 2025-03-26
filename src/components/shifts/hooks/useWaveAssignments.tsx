
import { useState, useEffect } from "react";
import { Employee } from "@/types/employee";
import { WaveAssignment } from "../types/wave-types";
import { useWaveAssignments as useModularWaveAssignments } from "./wave-assignments/useWaveAssignments";

export const useWaveAssignments = (
  scheduledEmployees: Employee[], 
  initialAssignments: WaveAssignment[] = []
) => {
  // Use our separated hooks via the main hook
  const {
    waves,
    employeesPerWave,
    assignments: defaultAssignments,
    handleAddWave,
    handleRemoveWave,
    handleWaveTimeChange,
    handleRequestedCountChange,
    handleEmployeeWaveChange,
    getEmployeeWaveId,
    applyWaveDistribution
  } = useModularWaveAssignments(scheduledEmployees);
  
  // Override assignments with initialAssignments if provided
  const [assignments, setAssignments] = useState<WaveAssignment[]>(
    initialAssignments.length > 0 ? initialAssignments : defaultAssignments
  );
  
  // Update assignments if initialAssignments changes
  useEffect(() => {
    if (initialAssignments.length > 0) {
      setAssignments(initialAssignments);
    }
  }, [initialAssignments]);
  
  // If we have initialAssignments but no default assignments yet, initialize with defaults
  useEffect(() => {
    if (!assignments.length && scheduledEmployees.length && waves.length > 0) {
      const newAssignments = scheduledEmployees.map(emp => ({
        employeeId: emp.id,
        startTime: waves[0].time,
        waveNumber: 1
      }));
      setAssignments(newAssignments);
    }
  }, [scheduledEmployees, assignments.length, waves]);
  
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
