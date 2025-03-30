
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { getMetricColorClass } from './utils';

interface MetricCellProps {
  metricName: string;
  value: number;
  unit: string;
}

const MetricCell: React.FC<MetricCellProps> = ({ metricName, value, unit }) => {
  // Special handling for metrics that represent "-" in the source data
  if (value === 0 && metricName === "CC" && unit === "%") {
    return (
      <TableCell className="text-gray-500">-</TableCell>
    );
  }
  
  // Format the value according to metric type
  let displayValue: string;
  
  if (metricName === "Delivered" && !unit) {
    // For absolute delivery numbers, no special formatting
    displayValue = value.toString();
  } else if (unit === "%") {
    // Format percentages with 2 decimal places
    displayValue = value.toFixed(2) + "%";
  } else if (metricName === "DNR DPMO") {
    // For DPMO values, round to whole numbers
    displayValue = Math.round(value).toString();
  } else if (metricName === "CE" && value === 0) {
    // For CE with value 0, it's a good thing
    displayValue = "0";
  } else {
    // Default formatting
    displayValue = value.toString();
  }
  
  return (
    <TableCell className={getMetricColorClass(metricName, value)}>
      {displayValue}
    </TableCell>
  );
};

export default MetricCell;
