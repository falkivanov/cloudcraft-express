
import React from "react";
import { Badge } from "@/components/ui/badge";

/**
 * Gets the background color class for a risk rating
 */
export const getRatingBackground = (risk: string | number | undefined): string => {
  if (!risk) return "";
  
  // Convert risk to string to handle cases where it might be a number or undefined
  const riskStr = String(risk);
  
  // Handle dash-like values
  if (riskStr === "-" || riskStr === "Unknown") {
    return "";
  }
  
  const lowerRisk = riskStr.toLowerCase();
  
  if (lowerRisk.includes("high")) {
    return "bg-red-50 border-red-200 text-red-700";
  } 
  if (lowerRisk.includes("medium")) {
    return "bg-amber-50 border-amber-200 text-amber-700";
  }
  if (lowerRisk.includes("low")) {
    return "bg-green-50 border-green-200 text-green-700";
  }
  
  // Handle German risk terms
  if (lowerRisk.includes("hoch")) {
    return "bg-red-50 border-red-200 text-red-700";
  }
  if (lowerRisk.includes("mittel")) {
    return "bg-amber-50 border-amber-200 text-amber-700";
  }
  if (lowerRisk.includes("niedrig")) {
    return "bg-green-50 border-green-200 text-green-700";
  }
  
  // Fallback
  return "";
};

/**
 * Formats and displays the FICO score with appropriate color coding
 */
export const getScoreDisplay = (score: string): React.ReactNode => {
  if (!score || score === "Unknown") return <span className="text-gray-500">-</span>;
  
  let numericScore = 0;
  // Extract numeric value if possible
  const matches = score.match(/\d+/);
  if (matches) {
    numericScore = parseInt(matches[0]);
  }
  
  // If no number found, show original text
  if (isNaN(numericScore)) return <span>{score}</span>;
  
  let color = "bg-red-100 border-red-200 text-red-800";
  
  if (numericScore >= 800) {
    color = "bg-green-100 border-green-200 text-green-800";
  } else if (numericScore >= 700) {
    color = "bg-emerald-100 border-emerald-200 text-emerald-800";
  } else if (numericScore >= 600) {
    color = "bg-amber-100 border-amber-200 text-amber-800";
  }
  
  return (
    <Badge variant="outline" className={`${color} font-bold px-3 py-1`}>
      {numericScore}
    </Badge>
  );
};
