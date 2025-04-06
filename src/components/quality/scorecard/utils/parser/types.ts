
import { KPIStatus } from '../helpers/statusHelper';

/**
 * Driver KPI interface used for structural parsing
 */
export interface DriverKPI {
  name: string;
  status: "active" | "former";
  metrics: {
    name: string;
    value: number;
    target: number;
    unit?: string;
    status?: KPIStatus;
  }[];
  score?: {
    total: number;
    rating: "gut" | "mittel" | "schlecht";
    color: string;
  };
}
