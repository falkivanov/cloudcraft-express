
export interface ScorecardKPI {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "neutral";
}

export interface DriverKPI {
  name: string;
  status: "active" | "former";
  metrics: {
    name: string;
    value: number;
    target: number;
  }[];
}
