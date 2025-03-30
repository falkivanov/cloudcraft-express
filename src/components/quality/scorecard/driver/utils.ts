
import { DriverKPI } from "../types";

/**
 * Calculate a score for a driver based on their KPIs
 * @param driver DriverKPI object
 * @returns Score object with total score and rating
 */
export const calculateDriverScore = (driver: DriverKPI) => {
  // Initialize weights for different metrics
  const weights = {
    "Delivered": 0.25,
    "DCR": 0.25,
    "DNR DPMO": 0.25,
    "POD": 0.05,
    "CC": 0.1,
    "CE": 0.05,
    "DEX": 0.05
  };
  
  let totalScore = 0;
  let weightSum = 0;
  
  // Calculate weighted score based on metrics
  driver.metrics.forEach(metric => {
    const weight = weights[metric.name as keyof typeof weights] || 0;
    
    if (weight > 0) {
      let score = 0;
      
      // Calculate score based on metric type
      if (metric.name === "DNR DPMO") {
        // For DNR DPMO, lower is better (inverse scale)
        // Use absolute value in case of negative values
        const value = Math.abs(metric.value);
        if (value <= 500) score = 100;
        else if (value <= 1000) score = 90;
        else if (value <= 1500) score = 80;
        else if (value <= 2000) score = 70;
        else if (value <= 2500) score = 60;
        else score = 50;
      } else if (metric.name === "DCR" || metric.name === "POD") {
        // For percentage metrics like DCR and POD
        if (metric.value >= 99.5) score = 100;
        else if (metric.value >= 99) score = 95;
        else if (metric.value >= 98) score = 85;
        else if (metric.value >= 97) score = 75;
        else if (metric.value >= 96) score = 65;
        else score = 55;
      } else if (metric.name === "CC") {
        // For Contact Compliance
        if (metric.value >= 95) score = 100;
        else if (metric.value >= 90) score = 90;
        else if (metric.value >= 85) score = 80;
        else if (metric.value >= 80) score = 70;
        else score = 60;
      } else if (metric.name === "Delivered") {
        // For Delivered packages (raw count or percentage)
        score = 90; // Default good score
        
        // If it's a percentage, use percentage-based scoring
        if (metric.unit === "%") {
          if (metric.value >= 98) score = 100;
          else if (metric.value >= 95) score = 90;
          else if (metric.value >= 90) score = 80;
          else score = 70;
        }
      } else {
        // Default scoring for other metrics
        if (metric.status === "fantastic") score = 100;
        else if (metric.status === "great") score = 90;
        else if (metric.status === "fair") score = 75;
        else if (metric.status === "poor") score = 60;
        else score = 70; // Default
      }
      
      totalScore += score * weight;
      weightSum += weight;
    }
  });
  
  // Calculate final score
  const finalScore = weightSum > 0 ? Math.round(totalScore / weightSum) : 75;
  
  // Determine rating and color
  let rating: "gut" | "mittel" | "schlecht" = "mittel";
  let color: string = "text-amber-500";
  
  if (finalScore >= 85) {
    rating = "gut";
    color = "text-green-600";
  } else if (finalScore < 70) {
    rating = "schlecht";
    color = "text-red-600";
  }
  
  return {
    total: finalScore,
    rating,
    color
  };
};

/**
 * Get the appropriate color class for a metric value
 */
export const getMetricColorClass = (metricName: string, value: number): string => {
  // Handle DNR DPMO (lower is better)
  if (metricName === "DNR DPMO") {
    const absValue = Math.abs(value); // Use absolute value
    if (absValue <= 500) return "text-green-600";
    if (absValue <= 1500) return "text-green-500";
    if (absValue <= 3000) return "text-amber-500";
    return "text-red-500";
  }
  
  // Handle percentage metrics
  if (metricName === "DCR" || metricName === "POD") {
    if (value >= 99) return "text-green-600";
    if (value >= 98) return "text-green-500";
    if (value >= 97) return "text-amber-500";
    return "text-red-500";
  }
  
  // Handle Contact Compliance
  if (metricName === "CC") {
    if (value >= 95) return "text-green-600";
    if (value >= 90) return "text-green-500";
    if (value >= 85) return "text-amber-500";
    return "text-red-500";
  }
  
  // Handle Customer Experience
  if (metricName === "CE") {
    if (value === 0) return "text-green-600"; // 0 is good for CE
    if (value <= 1) return "text-green-500";
    if (value <= 2) return "text-amber-500";
    return "text-red-500";
  }
  
  // Default for other metrics
  return "text-gray-700";
};
