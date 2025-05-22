
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
  // Add the missing shiftType property that's being used in the code
  shiftType?: "Arbeit" | "Frei" | "Termin" | "Urlaub" | "Krank" | null;
  confirmed?: boolean;
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

// Add the missing VehicleAssignment type that's being imported in various components
export interface VehicleAssignment {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  vehicleId: string;
  vehicleInfo: string;
  assignedAt: string;
  assignedBy: string;
}
