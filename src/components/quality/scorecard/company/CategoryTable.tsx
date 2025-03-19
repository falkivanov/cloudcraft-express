
import React from "react";
import { ScorecardKPI } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import KPITableRow from "./KPITableRow";

interface CategoryTableProps {
  title: string;
  kpis: ScorecardKPI[];
  previousWeekData?: any;
}

const CategoryTable: React.FC<CategoryTableProps> = ({ 
  title, 
  kpis,
  previousWeekData 
}) => {
  if (kpis.length === 0) return null;
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium border-b pb-2 mb-2">{title}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%] py-1 px-3 text-xs text-gray-500">Metric</TableHead>
            <TableHead className="w-[20%] py-1 px-3 text-center text-xs text-gray-500">Value</TableHead>
            <TableHead className="w-[20%] py-1 px-3 text-center text-xs text-gray-500">Target</TableHead>
            <TableHead className="w-[20%] py-1 px-3 text-center text-xs text-gray-500">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {kpis.map((kpi) => (
            <KPITableRow 
              key={kpi.name} 
              kpi={kpi} 
              previousWeekData={previousWeekData} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CategoryTable;
