
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
  let actualValue = value;
  
  // Ensure DNR DPMO is always positive for display (lower is better)
  if (metricName === "DNR DPMO" && value < 0) {
    actualValue = Math.abs(value);
  }
  
  if (metricName === "Delivered" && !unit) {
    // For absolute delivery numbers, no special formatting
    displayValue = actualValue.toString();
  } else if (unit === "%") {
    // Format percentages with 2 decimal places
    displayValue = actualValue.toFixed(2) + "%";
  } else if (metricName === "DNR DPMO") {
    // For DPMO values, round to whole numbers
    displayValue = Math.round(actualValue).toString();
  } else if (metricName === "CE" && actualValue === 0) {
    // For CE with value 0, it's a good thing
    displayValue = "0";
  } else {
    // Default formatting
    displayValue = actualValue.toString();
  }
  
  return (
    <TableCell className={getMetricColorClass(metricName, actualValue)}>
      {displayValue}
    </TableCell>
  );
};

export default MetricCell;
