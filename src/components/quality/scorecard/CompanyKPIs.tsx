
import React from "react";
import { CompanyKPIsProps } from "./types";
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
    "Delivery Completion Rate (DCR)",
    "Delivered Not Received (DNR DPMO)",
    "Lost on Road (LoR) DPMO"
  ],
  standardWork: [
    "Photo-On-Delivery",
    "Contact Compliance"
  ],
  capacity: [
    "Next Day Capacity Reliability",
    "Capacity Reliability"
  ]
};

const CompanyKPIs: React.FC<CompanyKPIsProps> = ({ companyKPIs, previousWeekData }) => {
  // Group the KPIs by category using our consistent definition above
  const safetyKPIs = companyKPIs.filter(kpi => 
    KPI_CATEGORIES.safety.some(name => kpi.name.includes(name))
  );
  
  const complianceKPIs = companyKPIs.filter(kpi => 
    KPI_CATEGORIES.compliance.some(name => kpi.name.includes(name))
  );
  
  const customerKPIs = companyKPIs.filter(kpi => 
    KPI_CATEGORIES.customer.some(name => kpi.name.includes(name))
  );
  
  const qualityKPIs = companyKPIs.filter(kpi => 
    KPI_CATEGORIES.quality.some(name => kpi.name.includes(name))
  );
  
  const standardWorkKPIs = companyKPIs.filter(kpi => 
    KPI_CATEGORIES.standardWork.some(name => kpi.name.includes(name))
  );
  
  const capacityKPIs = companyKPIs.filter(kpi => 
    KPI_CATEGORIES.capacity.some(name => kpi.name.includes(name))
  );

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Section header with period and summary */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Unternehmenskennzahlen</h2>
        {previousWeekData && (
          <span className="text-xs text-gray-500 italic">Vergleich: KW{previousWeekData.week}/{previousWeekData.year}</span>
        )}
      </div>
      
      {/* Render each KPI category */}
      <CategoryTable title="Sicherheit" kpis={safetyKPIs} previousWeekData={previousWeekData} />
      <CategoryTable title="Compliance" kpis={complianceKPIs} previousWeekData={previousWeekData} />
      <CategoryTable title="Kundenerfahrung" kpis={customerKPIs} previousWeekData={previousWeekData} />
      <CategoryTable title="Qualität" kpis={qualityKPIs} previousWeekData={previousWeekData} />
      <CategoryTable title="Standard Work" kpis={standardWorkKPIs} previousWeekData={previousWeekData} />
      <CategoryTable title="Kapazität" kpis={capacityKPIs} previousWeekData={previousWeekData} />
    </div>
  );
};

export default CompanyKPIs;
