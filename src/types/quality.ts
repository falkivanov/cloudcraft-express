
/**
 * Typendefinitionen für Qualitätsdaten
 */

// Scorecard-Statistiken
export interface ScorecardStatistics {
  period: string;
  location: string;
  timeRange: {
    start: string;
    end: string;
  };
  metrics: {
    overallScore: number;
    rank: number;
    rankChange: number;
    categoryScores: {
      safety: number;
      quality: number;
      customer: number;
      compliance: number;
      capacity: number;
      standardWork: number;
    };
    topDrivers: Array<{
      name: string;
      score: number;
    }>;
    improvementAreas: string[];
  };
}

// Fahrer-Performance
export interface DriverPerformance {
  id: string;
  name: string;
  metrics: {
    overall: number;
    safety: number;
    quality: number;
    customer: number;
    attendance: number;
  };
  trend: 'improving' | 'stable' | 'declining';
}

// Kundenkontakt-Compliance
export interface CustomerContactCompliance {
  week: number;
  year: number;
  overallCompliance: number;
  totalContacts: number;
  totalAddresses: number;
  driversData: Array<{
    name: string;
    totalAddresses: number;
    totalContacts: number;
    compliancePercentage: number;
  }>;
}

// Qualitätsbericht
export interface QualityReport {
  id: string;
  type: 'scorecard' | 'mentor' | 'customer_contact' | 'concessions';
  title: string;
  date: string;
  location: string;
  summary: string;
}

// Metrik-Trends
export interface MetricTrend {
  metric: string;
  label: string;
  location: string;
  timePeriod: string;
  data: Array<{
    date: string;
    value: number;
  }>;
}
