
import { Employee } from "@/types/employee";
import { WaveAssignment } from "../types/wave-types";

export interface WaveGroup {
  waveNumber: number;
  startTime: string;
  employees: Employee[];
}

export const groupEmployeesByWave = (
  waveAssignments: WaveAssignment[],
  scheduledEmployees: Employee[]
): Record<string, WaveGroup> => {
  return waveAssignments.reduce((groups, assignment) => {
    const { waveNumber, startTime, employeeId } = assignment;
    const waveKey = `${waveNumber}-${startTime}`;
    
    if (!groups[waveKey]) {
      groups[waveKey] = {
        waveNumber,
        startTime,
        employees: []
      };
    }
    
    const employee = scheduledEmployees.find(emp => emp.id === employeeId);
    if (employee) {
      groups[waveKey].employees.push(employee);
    }
    
    return groups;
  }, {} as Record<string, WaveGroup>);
};

export const getSortedWaves = (waveGroups: Record<string, WaveGroup>): WaveGroup[] => {
  return Object.values(waveGroups).sort((a, b) => 
    a.startTime.localeCompare(b.startTime) || a.waveNumber - b.waveNumber
  );
};

export const isSingleWave = (waves: WaveGroup[]): boolean => {
  return waves.length === 1;
};
