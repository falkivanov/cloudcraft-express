
export type KPIStatus = "fantastic" | "great" | "good" | "fair" | "poor" | "none" | "in compliance" | "not in compliance" | "at risk" | "needs improvement" | "on track" | "not applicable";

export type CategoryType = "safety" | "compliance" | "customer" | "standardWork" | "quality" | "capacity";

export interface CompanyKPI {
  name: string;
  value: number;
  target: number;
  status: KPIStatus;
  category: CategoryType;
  unit: string;
}

export interface DriverMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  status: KPIStatus;
}

export interface DriverKPI {
  name: string;
  status: string;
  metrics: DriverMetric[];
}

export interface CategorizedKPIs {
  safety: CompanyKPI[];
  compliance: CompanyKPI[];
  customer: CompanyKPI[];
  standardWork: CompanyKPI[];
  quality: CompanyKPI[];
  capacity: CompanyKPI[];
}

export interface ScoreCardData {
  week: number;
  year: number;
  location: string;
  overallScore: number;
  overallStatus: string;
  rank: number;
  rankNote: string;
  companyKPIs: CompanyKPI[];
  categorizedKPIs?: CategorizedKPIs;
  driverKPIs: DriverKPI[];
  recommendedFocusAreas: string[];
  isSampleData?: boolean;
}
