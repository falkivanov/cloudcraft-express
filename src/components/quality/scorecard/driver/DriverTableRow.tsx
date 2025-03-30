
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { DriverKPI } from "../types";
import MetricCell from "./MetricCell";

interface DriverTableRowProps {
  driver: DriverKPI;
}

const DriverTableRow: React.FC<DriverTableRowProps> = ({ driver }) => {
  // Extract just the name part without any ID in parentheses if present
  const displayName = driver.name.includes(" (") ? driver.name.split(" (")[0] : driver.name;
  
  return (
    <TableRow className="border-b border-gray-100 hover:bg-gray-50">
      <TableCell className="py-2 px-3 text-sm font-medium">{displayName}</TableCell>
      
      {/* Score cell */}
      <TableCell className="py-2 px-3 text-center">
        {driver.score && (
          <div className="flex flex-col items-center">
            <div className={`font-bold text-sm ${driver.score.color}`}>
              {driver.score.total}
            </div>
          </div>
        )}
      </TableCell>
      
      {driver.metrics.map((metric) => (
        <MetricCell 
          key={metric.name} 
          metricName={metric.name}
          value={metric.value}
          unit={metric.unit || ""}
        />
      ))}
    </TableRow>
  );
};

export default DriverTableRow;
