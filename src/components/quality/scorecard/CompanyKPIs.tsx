import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScorecardKPI } from "./types";

interface CompanyKPIsProps {
  companyKPIs: ScorecardKPI[];
}

const CompanyKPIs: React.FC<CompanyKPIsProps> = ({ companyKPIs }) => {
  // Get KPI status color based on status
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "fantastic":
        return "bg-blue-100 text-blue-800";
      case "great":
        return "bg-yellow-100 text-yellow-800";
      case "fair":
        return "bg-orange-100 text-orange-800";
      case "poor":
        return "bg-red-100 text-red-800";
      case "none":
        return "bg-gray-100 text-gray-800";
      case "in compliance":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Get KPI status style 
  const getKPIStatusStyle = (value: number, target: number, trend: "up" | "down" | "neutral", status?: string) => {
    if (status) {
      return getStatusColor(status);
    }
    
    if (trend === "up") {
      return value >= target ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800";
    } else if (trend === "down") {
      return value <= target ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800";
    }
    return "bg-gray-100 text-gray-800";
  };
  
  // Format KPI value display
  const formatKPIValue = (kpi: ScorecardKPI) => {
    if (kpi.status === "none") return "None";
    return `${kpi.value}${kpi.unit}`;
  };
  
  // Group KPIs by category
  const safetyKPIs = companyKPIs.filter(kpi => 
    ["Vehicle Audit (VSA) Compliance", "Safe Driving Metric (FICO)", "DVIC Compliance", 
     "Speeding Event Rate (Per 100 Trips)", "Mentor Adoption Rate"].includes(kpi.name)
  );
  
  const complianceKPIs = companyKPIs.filter(kpi => 
    ["Breach of Contract (BOC)", "Working Hours Compliance (WHC)", "Comprehensive Audit Score (CAS)"].includes(kpi.name)
  );
  
  const customerExperienceKPIs = companyKPIs.filter(kpi => 
    ["Customer escalation DPMO", "Customer Delivery Feedback"].includes(kpi.name)
  );
  
  const qualityKPIs = companyKPIs.filter(kpi => 
    ["Delivery Completion Rate (DCR)", "Delivered Not Received (DNR DPMO)"].includes(kpi.name)
  );
  
  const standardWorkComplianceKPIs = companyKPIs.filter(kpi => 
    ["Photo-On-Delivery", "Contact Compliance"].includes(kpi.name)
  );
  
  const capacityKPIs = companyKPIs.filter(kpi => 
    ["Capacity Reliability"].includes(kpi.name)
  );

  // Render a section of KPIs
  const renderKPISection = (title: string, kpis: ScorecardKPI[]) => {
    if (kpis.length === 0) return null;
    
    return (
      <div>
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {kpis.map((kpi, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>{kpi.name}</span>
                  <Badge className={getKPIStatusStyle(kpi.value, kpi.target, kpi.trend, kpi.status)}>
                    {formatKPIValue(kpi)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>Ziel: {kpi.target}{kpi.unit}</span>
                  {kpi.status && <span className="capitalize">{kpi.status}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {renderKPISection("Safety", safetyKPIs)}
          {renderKPISection("Compliance", complianceKPIs)}
        </div>
        <div>
          {renderKPISection("Customer Delivery Experience", customerExperienceKPIs)}
          {renderKPISection("Quality", qualityKPIs)}
          {renderKPISection("Standard Work Compliance", standardWorkComplianceKPIs)}
          {renderKPISection("Capacity", capacityKPIs)}
        </div>
      </div>
    </div>
  );
};

export default CompanyKPIs;
