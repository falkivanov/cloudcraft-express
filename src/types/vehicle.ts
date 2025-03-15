
export interface Vehicle {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  vinNumber: string;
  status: "Aktiv" | "In Werkstatt" | "Defleet";
  infleetDate: string;
  defleetDate: string | null;
}
