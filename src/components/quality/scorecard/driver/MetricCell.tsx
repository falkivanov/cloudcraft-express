
import React from "react";
import { TableCell } from "@/components/ui/table";

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
  
  return (
    <TableCell className="py-2 px-3 text-sm text-gray-900">
      {displayValue}
    </TableCell>
  );
};

export default MetricCell;
