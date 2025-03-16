
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";

type SortField = "licensePlate" | "brand" | "model" | "vinNumber" | "infleetDate";
type SortDirection = "asc" | "desc";

interface FleetTableHeaderProps {
  isDefleetView: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

const FleetTableHeader = ({ 
  isDefleetView, 
  sortField, 
  sortDirection, 
  onSort 
}: FleetTableHeaderProps) => {
  
  const SortableHeader = ({ field, children, className }: { field: SortField, children: React.ReactNode, className?: string }) => (
    <TableHead 
      className={`cursor-pointer hover:bg-gray-50 ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <ArrowUpDown className={`h-4 w-4 ${sortField === field ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
    </TableHead>
  );

  return (
    <TableHeader>
      <TableRow>
        <SortableHeader field="licensePlate" className="w-[15%]">Kennzeichen</SortableHeader>
        <SortableHeader field="brand" className="w-[12%]">Marke</SortableHeader>
        <SortableHeader field="model" className="w-[12%]">Modell</SortableHeader>
        <SortableHeader field="vinNumber" className="w-[20%]">FIN (VIN)</SortableHeader>
        <TableHead className="w-[15%]">Status</TableHead>
        <SortableHeader field="infleetDate" className="w-[15%]">Infleet Datum</SortableHeader>
        {isDefleetView && <TableHead className="w-[15%]">Defleet Datum</TableHead>}
        <TableHead className="text-right w-[10%]">Aktionen</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default FleetTableHeader;
