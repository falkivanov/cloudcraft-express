
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { DriverKPI } from "../types";
import MetricCell from "./MetricCell";
import { getPreviousDriverData } from "./utils";

interface DriverTableRowProps {
  driver: DriverKPI;
  previousWeekData: any;
}

const DriverTableRow: React.FC<DriverTableRowProps> = ({ driver, previousWeekData }) => {
  const prevDriver = getPreviousDriverData(driver.name, previousWeekData);
  
  return (
    <TableRow className="border-b border-gray-100 hover:bg-gray-50">
      <TableCell className="py-2 px-3 text-sm font-medium">{driver.name}</TableCell>
      
      {driver.metrics.map((metric) => (
        <MetricCell 
          key={metric.name} 
          metric={metric} 
          driverName={driver.name}
          previousWeekData={previousWeekData}
        />
      ))}
    </TableRow>
  );
};

export default DriverTableRow;
