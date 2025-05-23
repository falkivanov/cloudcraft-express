
import React from "react";
import { Card } from "@/components/ui/card";
import KPITableRow from "./KPITableRow";
import { ScoreCardData } from "./types";
import CategoryTable from "./company/CategoryTable";

interface CompanyKPIsProps {
  data: ScoreCardData | null;
}

const CompanyKPIs: React.FC<CompanyKPIsProps> = ({ data }) => {
  if (!data || !data.companyKPIs) {
    console.warn("CompanyKPIs: No data or company KPIs provided");
    return (
      <Card className="p-4">
        <div className="text-center py-8">
          <p className="text-gray-500">Keine Unternehmensdaten verfügbar</p>
        </div>
      </Card>
    );
  }

  // Extrahiere die KPIs nach Kategorie
  const categories = {
    safety: data.companyKPIs.filter(kpi => kpi.category === "safety") || [],
    quality: data.companyKPIs.filter(kpi => kpi.category === "quality") || [],
    customer: data.companyKPIs.filter(kpi => kpi.category === "customer") || [],
    standardWork: data.companyKPIs.filter(kpi => kpi.category === "standardWork") || [],
    compliance: data.companyKPIs.filter(kpi => kpi.category === "compliance") || [],
    capacity: data.companyKPIs.filter(kpi => kpi.category === "capacity") || []
  };

  // Falls categorizedKPIs existiert, nutze diese
  const categorizedKPIs = data.categorizedKPIs || categories;

  return (
    <div className="space-y-8">
      {/* Safety KPIs */}
      <CategoryTable 
        title="Safety & Compliance" 
        kpis={[...(categorizedKPIs.safety || []), ...(categorizedKPIs.compliance || [])]} 
      />

      {/* Customer Experience KPIs */}
      <CategoryTable 
        title="Customer Experience" 
        kpis={categorizedKPIs.customer || []} 
      />

      {/* Standard Work & Quality KPIs */}
      <CategoryTable 
        title="Standard Work & Quality" 
        kpis={[...(categorizedKPIs.standardWork || []), ...(categorizedKPIs.quality || [])]} 
      />

      {/* Capacity KPIs */}
      <CategoryTable 
        title="Capacity" 
        kpis={categorizedKPIs.capacity || []} 
      />
    </div>
  );
};

export default CompanyKPIs;
