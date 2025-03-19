
export interface ScorecardKPI {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "neutral";
  status?: "fantastic" | "great" | "fair" | "poor";
}

export interface DriverKPI {
  name: string;
  status: "active" | "former";
  metrics: {
    name: string;
    value: number;
    target: number;
    unit?: string;
    status?: "fantastic" | "great" | "fair" | "poor";
  }[];
}

export interface ScoreCardData {
  week: number;
  year: number;
  location: string;
  overallScore: number;
  overallStatus: string;
  rank: number;
  companyKPIs: ScorecardKPI[];
  driverKPIs: DriverKPI[];
  recommendedFocusAreas: string[];
}
