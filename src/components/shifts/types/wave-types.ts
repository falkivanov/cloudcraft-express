
import { Employee } from "@/types/employee";

export interface WaveAssignment {
  employeeId: string;
  startTime: string;
  waveNumber: number;
}

export interface Wave {
  id: number;
  time: string;
  requestedCount: number;
}

export interface WaveEmployeeCount {
  waveId: number;
  count: number;
}

export interface StartTimeWavesProps {
  scheduledEmployees: Employee[];
  onAssignWaves: (waveAssignments: WaveAssignment[]) => void;
}
