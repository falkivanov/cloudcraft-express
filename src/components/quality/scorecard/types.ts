
export interface ScorecardKPI {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "neutral";
  status?: "poor" | "fair" | "great" | "fantastic" | "none" | "in compliance" | "not in compliance" | "at risk" | "needs improvement" | "on track" | "not applicable";
  category?: "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity";
}

export interface DriverKPI {
  name: string;
  status: "active" | "former";
  metrics: {
    name: string;
    value: number;
    target: number;
    unit?: string;
    status?: "poor" | "fair" | "great" | "fantastic" | "none" | "in compliance" | "not in compliance" | "at risk" | "needs improvement" | "on track" | "not applicable";
  }[];
  score?: {
    total: number;
    rating: "gut" | "mittel" | "schlecht";
    color: string;
  };
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
  categorizedKPIs?: {
    safety: ScorecardKPI[];
    compliance: ScorecardKPI[];
    customer: ScorecardKPI[];
    standardWork: ScorecardKPI[];
    quality: ScorecardKPI[];
    capacity: ScorecardKPI[];
  };
  driverKPIs: DriverKPI[];
  recommendedFocusAreas: string[];
  isSampleData?: boolean; // Flag to indicate if data is sample data
  sectionRatings?: {
    complianceAndSafety: string;
    qualityAndSWC: string;
    capacity: string;
  };
  currentWeekTips?: string;
}

export interface CompanyKPIsProps {
  companyKPIs: ScorecardKPI[];
  previousWeekData?: ScoreCardData | null;
}

export interface DriverKPIsProps {
  driverKPIs: DriverKPI[];
  previousWeekData?: ScoreCardData | null;
}
