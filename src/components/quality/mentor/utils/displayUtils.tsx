
import { Badge } from "@/components/ui/badge";
import React from "react";

/**
 * Bestimmt die Farbe basierend auf dem Risiko-Level
 */
export const getRiskColor = (risk: string | number | undefined): string => {
  if (!risk) return "";
  
  // Convert risk to string to handle cases where it might be a number or undefined
  const riskStr = String(risk);
  const lowerRisk = riskStr.toLowerCase();
  
  if (lowerRisk.includes("high")) {
    return "bg-red-50 text-red-700 font-medium";
  } 
  if (lowerRisk.includes("medium")) {
    return "bg-amber-50 text-amber-700 font-medium";
  }
  if (lowerRisk.includes("low")) {
    return "bg-green-50 text-green-700 font-medium";
  }
  // Fallback
  return "";
};

/**
 * Formatiert und zeigt den FICO-Score mit passender Farbkodierung an
 */
export const getScoreDisplay = (score: string): React.ReactNode => {
  if (!score || score === "Unknown") return <span className="text-gray-500">-</span>;
  
  let numericScore = 0;
  // Versuche, einen nummerischen Wert zu extrahieren
  const matches = score.match(/\d+/);
  if (matches) {
    numericScore = parseInt(matches[0]);
  }
  
  // Wenn keine Zahl gefunden wurde, zeige den Original-Text an
  if (isNaN(numericScore)) return <span>{score}</span>;
  
  let color = "bg-red-100 text-red-800";
  if (numericScore >= 800) color = "bg-green-100 text-green-800";
  else if (numericScore >= 700) color = "bg-emerald-100 text-emerald-800";
  else if (numericScore >= 600) color = "bg-amber-100 text-amber-800";
  
  return (
    <Badge className={`${color} py-0.5 px-2`}>
      {numericScore}
    </Badge>
  );
};
