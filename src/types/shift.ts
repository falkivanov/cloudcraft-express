
export interface ShiftAssignment {
  id: string;
  employeeId: string;
  date: string;
  shiftType: "Arbeit" | "Frei" | "Termin" | "Urlaub" | "Krank";
  confirmed: boolean;
}

export interface VehicleAssignment {
  id: string;
  vehicleId: string;
  employeeId: string;
  date: string;
  assignedBy: string;
  assignedAt: string;
}

export interface WaveAssignment {
  employeeId: string;
  startTime: string;
  waveNumber: number;
}
