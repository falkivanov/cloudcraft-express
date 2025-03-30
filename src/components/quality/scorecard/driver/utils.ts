
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
      return "bg-gray-200 text-gray-500";
    default:
      return "bg-gray-100 text-gray-500";
  }
};

// Get the appropriate color class based on metric name and value
export const getMetricColorClass = (metricName: string, value: number): string => {
  // Special case for metrics with value 0 and status "none" (representing "-" in the data)
  if (value === 0 && metricName !== "DNR DPMO" && metricName !== "CE") {
    return "text-gray-400";
  }
  
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
    case "CC":
      if (value === 0) return "text-gray-400"; // For "-" value
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
      return "text-gray-700";
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

// Function to calculate driver score based on metrics and weightings
export const calculateDriverScore = (driver: DriverKPI) => {
  // Define weightings
  const weightings = {
    "DCR": 25,
    "DNR DPMO": 25,
    "POD": 6,
    "Contact Compliance": 14,
    "CC": 14,
    "DEX": 14,
    "CE": 16
  };

  let totalScore = 0;
  let maxPossibleScore = 0;

  driver.metrics.forEach(metric => {
    // Handle both "Contact Compliance" and "CC" as the same metric
    const metricName = metric.name === "Contact Compliance" ? "CC" : metric.name;
    const weight = weightings[metricName as keyof typeof weightings] || 0;
    
    if (!weight) return;
    
    // Skip "-" values (represented as value 0 with status "none") for CC
    if (metricName === "CC" && metric.status === "none" && metric.value === 0) {
      // Don't add to maxPossibleScore as this metric is not applicable
      return;
    }
    
    maxPossibleScore += weight;
    let points = 0;
    
    switch (metricName) {
      case "DCR":
        if (metric.value >= 99.5) points = weight;
        else if (metric.value >= 98) points = weight * 0.5;
        break;
      
      case "DNR DPMO":
        if (metric.value <= 1000) points = weight;
        else if (metric.value <= 1600) points = weight * 0.5;
        break;
      
      case "POD":
        if (metric.value >= 99) points = weight;
        else if (metric.value >= 97) points = weight * 0.5;
        break;
      
      case "CC":
        if (metric.status === "none") break; // Skip if it's a "-" value
        if (metric.value >= 99) points = weight;
        else if (metric.value >= 94) points = weight * 0.5;
        break;
      
      case "CE":
        if (metric.value === 0) points = weight;
        break;
      
      case "DEX":
        if (metric.value >= 95) points = weight;
        else if (metric.value >= 90) points = weight * 0.5;
        break;
    }
    
    totalScore += points;
  });

  const percentageScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
  
  let rating: "gut" | "mittel" | "schlecht" = "schlecht";
  let color = "text-red-500";
  
  if (percentageScore >= 80) {
    rating = "gut";
    color = "text-blue-600";
  } else if (percentageScore >= 50) {
    rating = "mittel";
    color = "text-orange-500";
  }
  
  return {
    total: percentageScore,
    rating,
    color
  };
};
