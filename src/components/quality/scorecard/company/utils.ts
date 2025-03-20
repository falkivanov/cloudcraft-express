import { ScorecardKPI } from "../types";

// Function to get the status badge class
export const getStatusClass = (status: string | undefined) => {
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
    case "none":
      return "bg-blue-100 text-blue-600"; // Blue for "none" to display as "fantastic"
    default:
      return "bg-gray-100 text-gray-500";
  }
};

// Get previous week KPI by name
export const getPreviousWeekKPI = (name: string, previousWeekData: any) => {
  if (!previousWeekData) return null;
  return previousWeekData.companyKPIs.find((kpi: ScorecardKPI) => kpi.name === name) || null;
};

// Function to calculate and format the change from previous week
export const getChangeDisplay = (current: number, previousKPI: ScorecardKPI | null) => {
  if (!previousKPI) return null;
  
  const previous = previousKPI.value;
  const difference = current - previous;
  
  // For metrics where a decrease is better (like DNR DPMO)
  const isMetricWhereDecreaseIsBetter = previousKPI.name.includes("DNR DPMO") || 
                                        previousKPI.name.includes("Speeding Event Rate") ||
                                        previousKPI.name.includes("Customer escalation");
  
  // For regular metrics: positive change is good, for inverse metrics: negative change is good
  const isPositive = isMetricWhereDecreaseIsBetter ? difference < 0 : difference > 0;
  
  // Color coding should match if the change is positive or negative in terms of performance
  const color = isPositive ? "text-green-500" : difference === 0 ? "text-gray-500" : "text-red-500";
  
  return {
    difference,
    display: `${difference > 0 ? "+" : ""}${Math.round(difference)}`,
    color,
    isPositive
  };
};

// Format KPI value based on whether it's a percentage or not
export const formatKPIValue = (value: number, unit: string) => {
  return value;
};
