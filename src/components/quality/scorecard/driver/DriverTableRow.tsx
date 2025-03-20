
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { DriverKPI } from "../types";
import MetricCell from "./MetricCell";
import { Shield } from "lucide-react";

interface DriverTableRowProps {
  driver: DriverKPI;
}

const DriverTableRow: React.FC<DriverTableRowProps> = ({ driver }) => {
  return (
    <TableRow className="border-b border-gray-100 hover:bg-gray-50">
      <TableCell className="py-2 px-3 text-sm font-medium">{driver.name}</TableCell>
      
      {/* Score cell */}
      <TableCell className="py-2 px-3 text-center">
        {driver.score && (
          <div className="flex flex-col items-center">
            <div className={`font-bold text-sm ${driver.score.color}`}>
              {driver.score.total}%
            </div>
            <div className="text-xs">
              <span className={`inline-flex items-center ${driver.score.color}`}>
                {driver.score.rating}
              </span>
            </div>
          </div>
        )}
      </TableCell>
      
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
