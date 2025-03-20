
import React from "react";
import { TableCell } from "@/components/ui/table";
import { formatValue, getMetricColorClass } from "./utils";

interface MetricCellProps {
  metric: {
    name: string;
    value: number;
    target: number;
    unit?: string;
    status?: string;
  };
}

const MetricCell: React.FC<MetricCellProps> = ({ metric }) => {
  // Get the appropriate color class based on the metric name and value
  const colorClass = getMetricColorClass(metric.name, metric.value);
  
  return (
    <TableCell className="py-2 px-3 text-center">
      <span className={colorClass}>
        {formatValue(metric.value, metric.unit || "")}{metric.unit}
      </span>
    </TableCell>
  );
};

export default MetricCell;
