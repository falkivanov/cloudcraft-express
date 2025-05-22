
export interface ShiftAssignment {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  vehicleId?: string;
  status: 'assigned' | 'completed' | 'cancelled';
  wave?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ShiftPlanRequest {
  date: string;
  requiredDrivers: number;
  waves: {
    name: string;
    startTime: string;
    requiredDrivers: number;
  }[];
}

export interface ShiftPlanResponse {
  date: string;
  assignments: ShiftAssignment[];
  unassignedEmployees: string[];
  waveDistribution: Record<string, string[]>; // Wave name -> Employee IDs
}
