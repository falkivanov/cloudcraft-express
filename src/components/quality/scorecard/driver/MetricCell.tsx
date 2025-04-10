import React from "react";
import { TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface MetricCellProps {
  metricName: string;
  value: number;
  unit?: string;
}

const MetricCell: React.FC<MetricCellProps> = ({ metricName, value, unit }) => {
  // Format the display value based on the metric type
  let displayValue;
  
  if (value === 0 && metricName !== "DNR DPMO" && metricName !== "CE" && metricName !== "Delivered") {
    displayValue = "-";
  } else if (metricName === "DNR DPMO") {
    // For DPMO, always display as integer
    displayValue = Math.round(value).toString();
  } else if (metricName === "Delivered" || metricName === "CE") {
    // For Delivered and CE, display as integer
    displayValue = Math.round(value).toString();
  } else if (unit === "%") {
    // For percentage values
    if (value <= 1 && value > 0) {
      // Value is in decimal form (e.g., 0.955)
      displayValue = `${(value * 100).toFixed(1)}%`;
    } else if (value > 1 && value <= 100) {
      // Value is already in percentage form (e.g., 95.5)
      displayValue = `${value.toFixed(1)}%`;
    } else if (value > 100) {
      // Handle very large values by dividing
      displayValue = `${(value / 100).toFixed(1)}%`;
    } else {
      // Handle zero or negative values
      displayValue = `${value}%`;
    }
  } else {
    // Default formatting
    displayValue = `${value}${unit || ''}`;
  }

  // Determine the color class based on metric name and value
  const colorClass = getMetricColorClass(metricName, value);
  
  return (
    <TableCell className={cn("py-2 px-3 text-sm text-center font-medium", colorClass)}>
      {displayValue}
    </TableCell>
  );
};

// Function to determine color classes based on metric thresholds
function getMetricColorClass(metricName: string, value: number): string {
  // For values that were previously zero or represented "-", keep gray color
  if (value === 0 && metricName !== "DNR DPMO" && metricName !== "CE" && metricName !== "Delivered") {
    return "text-gray-400";
  }

  // Apply color based on metric type and thresholds
  switch (metricName) {
    case "DCR":
      if (value >= 99.5) return "text-blue-600";
      if (value >= 98) return "text-orange-500";
      return "text-red-500";
      
    case "DNR DPMO":
      if (value <= 1000) return "text-blue-600";
      if (value <= 1600) return "text-orange-500";
      return "text-red-500";
      
    case "POD":
      if (value >= 99) return "text-blue-600";
      if (value >= 97) return "text-orange-500";
      return "text-red-500";
      
    case "CC":
      if (value === 0 && displayValue === "-") return "text-gray-400"; // Handle dash case
      if (value >= 99) return "text-blue-600";
      if (value >= 94) return "text-orange-500";
      return "text-red-500";
      
    case "CE":
      if (value === 0) return "text-blue-600";
      return "text-red-500";
      
    case "DEX":
      if (value >= 90) return "text-blue-600";
      if (value >= 80) return "text-orange-500";
      return "text-red-500";
      
    default:
      return "text-gray-700";
  }
}

export default MetricCell;
