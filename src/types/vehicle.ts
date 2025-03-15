
export interface Vehicle {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  vinNumber: string;
  status: string;
  infleetDate: string;
  defleetDate: string | null;
}
