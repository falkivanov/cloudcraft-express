
import React from "react";
import { ScorecardKPI, ScoreCardData } from "./types";
import CategoryTable from "./company/CategoryTable";

// Define the KPI categories and their member KPIs to ensure consistency
const KPI_CATEGORIES = {
  safety: [
    "Vehicle Audit (VSA) Compliance",
    "Safe Driving Metric (FICO)",
    "DVIC Compliance",
    "Speeding Event Rate (Per 100 Trips)",
    "Mentor Adoption Rate"
  ],
  compliance: [
    "Breach of Contract (BOC)",
    "Working Hours Compliance (WHC)",
    "Comprehensive Audit Score (CAS)"
  ],
  customer: [
    "Customer escalation DPMO",
    "Customer Delivery Feedback"
  ],
  quality: [
    "Delivered Not Received (DNR DPMO)",
    "Lost on Road (LoR) DPMO",
    "Delivery Completion Rate (DCR)"
  ],
  standardWork: [
    "Photo-On-Delivery",
    "Contact Compliance"
  ],
  capacity: [
    "Next Day Capacity Reliability",
    "Capacity Reliability"
  ],
  other: [] // For any KPIs that don't match the predefined categories
};

export interface CompanyKPIsProps {
  companyKPIs: ScorecardKPI[];
  previousWeekData: ScoreCardData | null;
}

const CompanyKPIs: React.FC<CompanyKPIsProps> = ({ companyKPIs, previousWeekData }) => {
  // Group the KPIs by category
  const categorizedKPIs = {
    safety: [] as ScorecardKPI[],
    compliance: [] as ScorecardKPI[],
    customer: [] as ScorecardKPI[],
    quality: [] as ScorecardKPI[],
    standardWork: [] as ScorecardKPI[],
    capacity: [] as ScorecardKPI[],
    other: [] as ScorecardKPI[]
  };
  
  // Function to check if a KPI name contains or matches any of the category keywords
  const matchesCategory = (kpiName: string, categoryKeywords: string[]): boolean => {
    return categoryKeywords.some(keyword => 
      kpiName.toLowerCase().includes(keyword.toLowerCase()) ||
      keyword.toLowerCase().includes(kpiName.split(' ')[0].toLowerCase())
    );
  };
  
  // Categorize each KPI
  companyKPIs.forEach(kpi => {
    // If KPI already has a category, use that
    if (kpi.category) {
      categorizedKPIs[kpi.category as keyof typeof categorizedKPIs].push(kpi);
      return;
    }
    
    let categorized = false;
    
    // Try to categorize based on predefined categories
    for (const [category, keywords] of Object.entries(KPI_CATEGORIES)) {
      if (category !== 'other' && matchesCategory(kpi.name, keywords)) {
        categorizedKPIs[category as keyof typeof categorizedKPIs].push(kpi);
        categorized = true;
        break;
      }
    }
    
    // If not categorized, put in 'other'
    if (!categorized) {
      categorizedKPIs.other.push(kpi);
    }
  });
  
  // Move KPIs from 'other' to appropriate categories based on keywords if possible
  const keywordMap = {
    safety: ['safe', 'safety', 'speeding', 'accident', 'incident', 'mentor'],
    quality: ['quality', 'dcr', 'dnr', 'lor', 'delivery', 'received'],
    customer: ['customer', 'csat', 'satisfaction', 'escalation', 'feedback'],
    compliance: ['compliance', 'audit', 'boc', 'breach', 'hours', 'whc', 'cas'],
    standardWork: ['standard', 'photo', 'pod', 'contact', 'attempt'],
    capacity: ['capacity', 'reliability', 'next day']
  };
  
  const remainingOther = [...categorizedKPIs.other];
  categorizedKPIs.other = [];
  
  remainingOther.forEach(kpi => {
    let categorized = false;
    
    for (const [category, keywords] of Object.entries(keywordMap)) {
      if (keywords.some(keyword => kpi.name.toLowerCase().includes(keyword))) {
        categorizedKPIs[category as keyof typeof categorizedKPIs].push(kpi);
        categorized = true;
        break;
      }
    }
    
    if (!categorized) {
      categorizedKPIs.other.push(kpi);
    }
  });

  return (
    <div className="w-full mx-auto">
      {/* Section header with period and summary */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Unternehmenskennzahlen</h2>
        {previousWeekData && (
          <span className="text-xs text-gray-500 italic">Vergleich: KW{previousWeekData.week}/{previousWeekData.year}</span>
        )}
      </div>
      
      {/* Display the total number of KPIs */}
      <div className="mb-4 text-sm text-gray-600">
        Zeige {companyKPIs.length} KPIs im Scorecard
      </div>
      
      {/* Render each KPI category */}
      {categorizedKPIs.safety.length > 0 && (
        <CategoryTable title="Sicherheit" kpis={categorizedKPIs.safety} previousWeekData={previousWeekData} />
      )}
      
      {categorizedKPIs.compliance.length > 0 && (
        <CategoryTable title="Compliance" kpis={categorizedKPIs.compliance} previousWeekData={previousWeekData} />
      )}
      
      {categorizedKPIs.customer.length > 0 && (
        <CategoryTable title="Kundenerfahrung" kpis={categorizedKPIs.customer} previousWeekData={previousWeekData} />
      )}
      
      {categorizedKPIs.quality.length > 0 && (
        <CategoryTable title="Qualität" kpis={categorizedKPIs.quality} previousWeekData={previousWeekData} />
      )}
      
      {categorizedKPIs.standardWork.length > 0 && (
        <CategoryTable title="Standard Work" kpis={categorizedKPIs.standardWork} previousWeekData={previousWeekData} />
      )}
      
      {categorizedKPIs.capacity.length > 0 && (
        <CategoryTable title="Kapazität" kpis={categorizedKPIs.capacity} previousWeekData={previousWeekData} />
      )}
      
      {categorizedKPIs.other.length > 0 && (
        <CategoryTable title="Weitere KPIs" kpis={categorizedKPIs.other} previousWeekData={previousWeekData} />
      )}
    </div>
  );
};

export default CompanyKPIs;
