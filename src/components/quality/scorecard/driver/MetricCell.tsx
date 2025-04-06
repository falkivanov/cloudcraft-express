
import React from "react";
import { TableCell } from "@/components/ui/table";

interface MetricCellProps {
  metricName: string;
  value: number;
  unit?: string;
}

const MetricCell: React.FC<MetricCellProps> = ({ metricName, value, unit }) => {
  // Format the display value based on the metric type
  const displayValue = 
    value === 0 && metricName !== "DNR DPMO" && metricName !== "CE" && metricName !== "Delivered" 
      ? "-" 
      : metricName === "DNR DPMO" || metricName === "CE" || !unit || unit === ""
        ? value.toString()
        : `${value}${unit}`;
  
  return (
    <TableCell className="py-2 px-3 text-sm text-gray-900">
      {displayValue}
    </TableCell>
  );
};

export default MetricCell;
