
export interface ShiftAssignment {
  id: string;
  employeeId: string;
  date: string;
  shiftType: "Früh" | "Spät" | "Nacht";
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
