
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
    if (value > 100 && value <= 10000) {
      // Value is likely already multiplied by 100, display with 1-2 decimal places
      displayValue = `${(value/100).toFixed(value % 100 === 0 ? 0 : 2)}%`;
    } else {
      // Normal percentage display
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
