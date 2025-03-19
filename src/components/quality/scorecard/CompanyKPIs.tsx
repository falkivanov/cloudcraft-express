
import React from "react";
import { ScorecardKPI, CompanyKPIsProps } from "./types";
import { ArrowUp, ArrowDown, CircleDot } from "lucide-react";

const CompanyKPIs: React.FC<CompanyKPIsProps> = ({ companyKPIs, previousWeekData }) => {
  // Function to get the status badge class
  const getStatusClass = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-500";
    
    switch (status.toLowerCase()) {
      case "fantastic":
        return "bg-blue-100 text-blue-600";
      case "great":
        return "bg-yellow-100 text-yellow-600";
      case "fair":
        return "bg-orange-100 text-orange-600";
      case "poor":
        return "bg-red-100 text-red-600";
      case "in compliance":
        return "bg-green-100 text-green-600";
      case "not in compliance":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };
  
  // Function to get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUp className="h-3 w-3" />;
      case "down":
        return <ArrowDown className="h-3 w-3" />;
      default:
        return <CircleDot className="h-3 w-3" />;
    }
  };

  // Get previous week KPI by name
  const getPreviousWeekKPI = (name: string) => {
    if (!previousWeekData) return null;
    return previousWeekData.companyKPIs.find(kpi => kpi.name === name) || null;
  };

  // Function to calculate and format the change from previous week
  const getChangeDisplay = (current: number, previousKPI: ScorecardKPI | null) => {
    if (!previousKPI) return null;
    
    const previous = previousKPI.value;
    const difference = current - previous;
    const isPositive = difference > 0;
    const color = isPositive ? "text-green-500" : difference < 0 ? "text-red-500" : "text-gray-500";
    
    return {
      difference,
      display: `${isPositive ? "+" : ""}${Math.round(difference)}`,
      color
    };
  };

  // Format KPI value based on whether it's a percentage or not
  const formatKPIValue = (value: number, unit: string) => {
    return Math.round(value);
  };

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

  // Render a KPI row with comparison
  const renderKPIRow = (kpi: ScorecardKPI) => {
    const previousKPI = getPreviousWeekKPI(kpi.name);
    const change = getChangeDisplay(kpi.value, previousKPI);
    
    // Determine if the change is good or bad based on the KPI's trend direction
    // and also check if the current value meets the target
    const isAtOrBetterThanTarget = 
      (kpi.trend === "up" && kpi.value >= kpi.target) || 
      (kpi.trend === "down" && kpi.value <= kpi.target);
    
    const isPositiveChange = change && (
      (kpi.trend === "up" && change.difference > 0) || 
      (kpi.trend === "down" && change.difference < 0) ||
      // Add condition: if change is 0 but we meet the target, consider it positive
      (change.difference === 0 && isAtOrBetterThanTarget)
    );
    
    const changeColor = change ? 
      (isPositiveChange ? "text-green-500" : "text-red-500") : 
      "";

    return (
      <tr key={kpi.name} className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-2 px-3 text-sm">{kpi.name}</td>
        <td className="py-2 px-3 text-right whitespace-nowrap">
          <div className="flex items-center justify-end gap-2">
            <span className="font-medium">{formatKPIValue(kpi.value, kpi.unit)}{kpi.unit}</span>
            {change && (
              <span className={`text-xs flex items-center ${changeColor}`}>
                {isPositiveChange ? (
                  <ArrowUp className="h-3 w-3 mr-0.5" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-0.5" />
                )}
                {change.display}{kpi.unit}
              </span>
            )}
            {previousKPI && !change && (
              <span className="text-xs text-gray-500">
                (Vorwoche: {formatKPIValue(previousKPI.value, kpi.unit)}{kpi.unit})
              </span>
            )}
          </div>
        </td>
        <td className="py-2 px-3 text-right text-sm">{formatKPIValue(kpi.target, kpi.unit)}{kpi.unit}</td>
        <td className="py-2 px-3 text-right">
          <div className="flex justify-end">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getStatusClass(kpi.status)}`}>
              {kpi.status || "N/A"}
            </span>
          </div>
        </td>
      </tr>
    );
  };

  // Render a category of KPIs
  const renderKPICategory = (title: string, kpis: ScorecardKPI[]) => (
    <div className="mb-6">
      <h3 className="text-sm font-medium border-b pb-2 mb-2">{title}</h3>
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-gray-500">
            <th className="py-1 px-3">Metric</th>
            <th className="py-1 px-3 text-right">Value</th>
            <th className="py-1 px-3 text-right">Target</th>
            <th className="py-1 px-3 text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {kpis.map(renderKPIRow)}
        </tbody>
      </table>
    </div>
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
      {renderKPICategory("Sicherheit", safetyKPIs)}
      {renderKPICategory("Compliance", complianceKPIs)}
      {renderKPICategory("Kundenerfahrung", customerKPIs)}
      {renderKPICategory("Qualität", qualityKPIs)}
      {renderKPICategory("Standard Work", standardWorkKPIs)}
      {renderKPICategory("Kapazität", capacityKPIs)}
    </div>
  );
};

export default CompanyKPIs;
