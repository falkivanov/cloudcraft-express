
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { DriverKPI } from "../types";
import MetricCell from "./MetricCell";

interface DriverTableRowProps {
  driver: DriverKPI;
}

const DriverTableRow: React.FC<DriverTableRowProps> = ({ driver }) => {
  return (
    <TableRow className="border-b border-gray-100 hover:bg-gray-50">
      <TableCell className="py-2 px-3 text-sm font-medium">{driver.name}</TableCell>
      
      {driver.metrics.map((metric) => (
        <MetricCell 
          key={metric.name} 
          metric={metric} 
        />
      ))}
    </TableRow>
  );
};

export default DriverTableRow;
