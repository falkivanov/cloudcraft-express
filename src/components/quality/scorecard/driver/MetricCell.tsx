
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
  } else if (metricName === "DNR DPMO" || metricName === "CE" || !unit || unit === "") {
    // For non-percentage metrics, display as is
    displayValue = value.toString();
  } else if (unit === "%") {
    // Handle percentage values
    // Check if the value is already formatted as a percentage (>100)
    if (value > 1 && value <= 100) {
      // Normal percentage value (e.g. 95.5%)
      displayValue = `${value}%`;
    } else if (value > 0 && value <= 1) {
      // Value is likely in decimal form (e.g. 0.955)
      displayValue = `${(value * 100).toFixed(value % 0.1 === 0 ? 0 : 2)}%`;
    } else if (value > 100) {
      // Value might be multiplied by 100 already (e.g. 9550 meaning 95.5%)
      displayValue = `${(value/100).toFixed(value % 100 === 0 ? 0 : 2)}%`;
    } else {
      // Fallback
      displayValue = `${value}%`;
    }
  } else {
    // Default formatting
    displayValue = `${value}${unit}`;
  }
  
  return (
    <TableCell className="py-2 px-3 text-sm text-gray-900">
      {displayValue}
    </TableCell>
  );
};

export default MetricCell;
