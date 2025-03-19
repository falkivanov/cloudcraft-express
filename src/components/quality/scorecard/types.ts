
export interface ScorecardKPI {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "neutral";
  status?: "fantastic" | "great" | "fair" | "poor" | "none" | "in compliance" | "not in compliance";
}

export interface DriverKPI {
  name: string;
  status: "active" | "former";
  metrics: {
    name: string;
    value: number;
    target: number;
    unit?: string;
    status?: "fantastic" | "great" | "fair" | "poor" | "none" | "in compliance" | "not in compliance";
  }[];
}

export interface ScoreCardData {
  week: number;
  year: number;
  location: string;
  overallScore: number;
  overallStatus: string;
  rank: number;
  rankNote?: string;
  companyKPIs: ScorecardKPI[];
  driverKPIs: DriverKPI[];
  recommendedFocusAreas: string[];
  sectionRatings?: {
    complianceAndSafety: string;
    qualityAndSWC: string;
    capacity: string;
  };
  currentWeekTips?: string;
}
