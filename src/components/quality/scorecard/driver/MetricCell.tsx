
import React from "react";
import { TableCell } from "@/components/ui/table";
import { getMetricColorClass } from "./utils";

interface MetricCellProps {
  metricName: string;
  value: number;
  unit?: string;
}

const MetricCell: React.FC<MetricCellProps> = ({ metricName, value, unit }) => {
  const colorClass = getMetricColorClass(metricName, value);
  
  // Format the display value based on the metric type
  const displayValue = 
    value === 0 && metricName !== "DNR DPMO" && metricName !== "CE" && metricName !== "Delivered" 
      ? "-" 
      : metricName === "DNR DPMO" || metricName === "CE" || !unit || unit === ""
        ? value.toString()
        : `${value}${unit}`;
  
  return (
    <TableCell className={`py-2 px-3 text-sm ${colorClass}`}>
      {displayValue}
    </TableCell>
  );
};

export default MetricCell;
