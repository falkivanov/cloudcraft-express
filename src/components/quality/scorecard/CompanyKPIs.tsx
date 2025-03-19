
import React from "react";
import { CompanyKPIsProps } from "./types";
import CategoryTable from "./company/CategoryTable";

const CompanyKPIs: React.FC<CompanyKPIsProps> = ({ companyKPIs, previousWeekData }) => {
  // Group the KPIs by category
  const safetyKPIs = companyKPIs.filter(kpi => 
    ["Vehicle Audit (VSA) Compliance", "Safe Driving Metric (FICO)", "DVIC Compliance", 
     "Speeding Event Rate (Per 100 Trips)", "Mentor Adoption Rate"].includes(kpi.name)
  );
  
  const complianceKPIs = companyKPIs.filter(kpi => 
    ["Breach of Contract (BOC)", "Working Hours Compliance (WHC)", 
     "Comprehensive Audit Score (CAS)"].includes(kpi.name)
  );
  
  const customerKPIs = companyKPIs.filter(kpi => 
    ["Customer escalation DPMO", "Customer Delivery Feedback"].includes(kpi.name)
  );
  
  const qualityKPIs = companyKPIs.filter(kpi => 
    ["Delivery Completion Rate (DCR)", "Delivered Not Received (DNR DPMO)"].includes(kpi.name)
  );
  
  const standardWorkKPIs = companyKPIs.filter(kpi => 
    ["Photo-On-Delivery", "Contact Compliance"].includes(kpi.name)
  );
  
  const capacityKPIs = companyKPIs.filter(kpi => 
    ["Capacity Reliability"].includes(kpi.name)
  );

  return (
    <div className="space-y-6">
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
