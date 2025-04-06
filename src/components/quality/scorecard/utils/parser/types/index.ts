
import { KPIStatus } from "../../../helpers/statusHelper";

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

/**
 * Default metric definitions
 */
export const METRIC_NAMES = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
export const METRIC_TARGETS = [0, 98.5, 1500, 98, 95, 0, 95];
export const METRIC_UNITS = ["", "%", "DPMO", "%", "%", "", "%"];

/**
 * Re-export KPIStatus from statusHelper for convenience
 */
export { KPIStatus };
