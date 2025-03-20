
import { DriverKPI } from "../types";

// Function to get status badge styling
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
    case "none":
      return "bg-blue-100 text-blue-600"; // Treat none as fantastic for consistency
    default:
      return "bg-gray-100 text-gray-500";
  }
};

// Get the appropriate color class based on metric name and value
export const getMetricColorClass = (metricName: string, value: number): string => {
  switch (metricName) {
    case "DCR":
      if (value >= 99.5) return "text-blue-600 font-semibold";
      if (value >= 98) return "text-orange-500 font-semibold";
      return "text-red-500 font-semibold";
      
    case "DNR DPMO":
      if (value <= 1000) return "text-blue-600 font-semibold";
      if (value <= 1600) return "text-orange-500 font-semibold";
      return "text-red-500 font-semibold";
      
    case "POD":
      if (value >= 99) return "text-blue-600 font-semibold";
      if (value >= 97) return "text-orange-500 font-semibold";
      return "text-red-500 font-semibold";
      
    case "Contact Compliance":
      if (value >= 99) return "text-blue-600 font-semibold";
      if (value >= 94) return "text-orange-500 font-semibold";
      return "text-red-500 font-semibold";
      
    case "CE":
      return value === 0 ? "text-blue-600 font-semibold" : "text-red-500 font-semibold";
      
    case "DEX":
      if (value >= 95) return "text-blue-600 font-semibold";
      if (value >= 90) return "text-orange-500 font-semibold";
      return "text-red-500 font-semibold";
      
    default:
      return "text-gray-700"; // Default color for other metrics
  }
};

// Find previous week's data for a driver
export const getPreviousDriverData = (driverName: string, previousWeekData: any) => {
  if (!previousWeekData) return null;
  return previousWeekData.driverKPIs.find((d: DriverKPI) => d.name === driverName) || null;
};

// Get previous metric data
export const getPreviousMetricData = (driverName: string, metricName: string, previousWeekData: any) => {
  const prevDriver = getPreviousDriverData(driverName, previousWeekData);
  if (!prevDriver) return null;
  
  return prevDriver.metrics.find(m => m.name === metricName) || null;
};

// Format value based on metric name
export const formatValue = (value: number, unit: string) => {
  return value;
};

// Function to calculate and format the change from previous week
export const getChangeDisplay = (current: number, previousValue: number | null) => {
  if (previousValue === null) return null;
  
  const difference = current - previousValue;
  const isPositive = difference > 0;
  
  return {
    difference,
    display: `${isPositive ? "+" : ""}${Math.round(difference)}`,
    isPositive
  };
};
