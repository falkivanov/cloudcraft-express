
export interface RepairEntry {
  id: string;
  date: string;
  startDate: string;
  endDate: string;
  description: string;
  location: string;
  duration: number; // Automatically calculated from startDate/endDate
  totalCost: number;
  companyPaidAmount: number;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  description: string;
  location: string;
  appointmentType: "Inspektion" | "Reparatur" | "Reifenwechsel" | "Sonstiges";
  completed: boolean;
}

export interface Vehicle {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  vinNumber: string;
  status: "Aktiv" | "In Werkstatt" | "Defleet";
  infleetDate: string;
  defleetDate: string | null;
  repairs?: RepairEntry[];
  appointments?: Appointment[];
}
