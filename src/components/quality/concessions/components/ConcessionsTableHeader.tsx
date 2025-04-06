
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";

interface ConcessionsTableHeaderProps {
  sortConfig: {
    key: string;
    direction: 'ascending' | 'descending';
  };
  requestSort: (key: string) => void;
}

const ConcessionsTableHeader: React.FC<ConcessionsTableHeaderProps> = ({ 
  sortConfig, 
  requestSort 
}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-10"></TableHead>
        <TableHead className="cursor-pointer" onClick={() => requestSort('driverName')}>
          <div className="flex items-center gap-1">
            Fahrer
            {sortConfig.key === 'driverName' && (
              <ArrowUpDown className="h-4 w-4" />
            )}
          </div>
        </TableHead>
        <TableHead className="cursor-pointer" onClick={() => requestSort('transportId')}>
          <div className="flex items-center gap-1">
            Transport ID
            {sortConfig.key === 'transportId' && (
              <ArrowUpDown className="h-4 w-4" />
            )}
          </div>
        </TableHead>
        <TableHead className="cursor-pointer" onClick={() => requestSort('count')}>
          <div className="flex items-center gap-1">
            Anzahl
            {sortConfig.key === 'count' && (
              <ArrowUpDown className="h-4 w-4" />
            )}
          </div>
        </TableHead>
        <TableHead className="text-right cursor-pointer" onClick={() => requestSort('totalCost')}>
          <div className="flex items-center justify-end gap-1">
            Kosten
            {sortConfig.key === 'totalCost' && (
              <ArrowUpDown className="h-4 w-4" />
            )}
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ConcessionsTableHeader;
