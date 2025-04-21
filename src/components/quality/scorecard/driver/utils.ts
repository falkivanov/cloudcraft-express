
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
  // For values that were previously zero or represented "-", keep gray color
  if (value === 0 && metricName !== "DNR DPMO" && metricName !== "CE" && metricName !== "Delivered") {
    return "text-gray-400";
  }
  
  // Return a neutral text color for all metrics
  return "text-gray-700";
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

// Interface for driver KPI targets
interface DriverKpiTarget {
  name: string;
  scoreTarget: number;
  colorTarget: number;
  unit?: string;
}

// Function to load target values from localStorage
const loadTargetValues = (): DriverKpiTarget[] => {
  try {
    const storedTargets = localStorage.getItem("scorecard_driver_targets");
    if (storedTargets) {
      return JSON.parse(storedTargets);
    }
  } catch (e) {
    console.error("Error loading driver KPI targets:", e);
  }
  
  // Default values if nothing in localStorage
  return [
    { name: "DCR", scoreTarget: 99.5, colorTarget: 98, unit: "%" },
    { name: "DNR DPMO", scoreTarget: 1000, colorTarget: 1600, unit: "DPMO" },
    { name: "POD", scoreTarget: 99, colorTarget: 97, unit: "%" },
    { name: "CC", scoreTarget: 99, colorTarget: 94, unit: "%" },
    { name: "CE", scoreTarget: 0, colorTarget: 0, unit: "" },
    { name: "DEX", scoreTarget: 95, colorTarget: 90, unit: "%" }
  ];
};

// Function to calculate driver score based on metrics and weightings from localStorage
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

  // Load current target values
  const targets = loadTargetValues();

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
    
    // Find target for this metric
    const target = targets.find(t => t.name === metricName);
    
    switch (metricName) {
      case "DCR":
        if (target) {
          if (metric.value >= target.scoreTarget) points = weight;
          else if (metric.value >= target.colorTarget) points = weight * 0.5;
        } else {
          if (metric.value >= 99.5) points = weight;
          else if (metric.value >= 98) points = weight * 0.5;
        }
        break;
      
      case "DNR DPMO":
        if (target) {
          if (metric.value <= target.scoreTarget) points = weight;
          else if (metric.value <= target.colorTarget) points = weight * 0.5;
        } else {
          if (metric.value <= 1000) points = weight;
          else if (metric.value <= 1600) points = weight * 0.5;
        }
        break;
      
      case "POD":
        if (target) {
          if (metric.value >= target.scoreTarget) points = weight;
          else if (metric.value >= target.colorTarget) points = weight * 0.5;
        } else {
          if (metric.value >= 99) points = weight;
          else if (metric.value >= 97) points = weight * 0.5;
        }
        break;
      
      case "CC":
        if (metric.status === "none") break; // Skip if it's a "-" value
        if (target) {
          if (metric.value >= target.scoreTarget) points = weight;
          else if (metric.value >= target.colorTarget) points = weight * 0.5;
        } else {
          if (metric.value >= 99) points = weight;
          else if (metric.value >= 94) points = weight * 0.5;
        }
        break;
      
      case "CE":
        if (metric.value === 0) points = weight;
        break;
      
      case "DEX":
        if (target) {
          if (metric.value >= target.scoreTarget) points = weight;
          else if (metric.value >= target.colorTarget) points = weight * 0.5;
        } else {
          if (metric.value >= 95) points = weight;
          else if (metric.value >= 90) points = weight * 0.5;
        }
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
