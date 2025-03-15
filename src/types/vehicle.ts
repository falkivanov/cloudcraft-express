
export interface RepairEntry {
  id: string;
  date: string;
  description: string;
  duration: number; // Dauer in Tagen
  totalCost: number;
  companyPaidAmount: number;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  description: string;
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
