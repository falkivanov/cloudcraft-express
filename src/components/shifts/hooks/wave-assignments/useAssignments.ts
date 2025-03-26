import { useState, useCallback } from "react";
import { WaveAssignment } from "../../types/wave-types";
import { Employee } from "@/types/employee";

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
  
  return {
    assignments,
    setAssignments,
    getEmployeeWaveId,
    updateEmployeeWaveId
  };
};
