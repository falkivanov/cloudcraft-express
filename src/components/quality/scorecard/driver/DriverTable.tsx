
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DriverKPI } from "../types";
import DriverTableRow from "./DriverTableRow";

interface DriverTableProps {
  drivers: DriverKPI[];
  previousWeekData: any;
}

const DriverTable: React.FC<DriverTableProps> = ({ drivers, previousWeekData }) => {
  if (drivers.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        Keine Fahrer in dieser Kategorie vorhanden
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="py-1 px-3 text-xs text-gray-500">Fahrer</TableHead>
            {drivers[0].metrics.map((metric: any) => (
              <TableHead key={metric.name} className="py-1 px-3 text-center text-xs text-gray-500">{metric.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => (
            <DriverTableRow 
              key={driver.name} 
              driver={driver} 
              previousWeekData={previousWeekData} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DriverTable;
