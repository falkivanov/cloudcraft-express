
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface FleetTableHeaderProps {
  isDefleetView: boolean;
}

const FleetTableHeader = ({ isDefleetView }: FleetTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[15%]">Kennzeichen</TableHead>
        <TableHead className="w-[12%]">Marke</TableHead>
        <TableHead className="w-[12%]">Modell</TableHead>
        <TableHead className="w-[20%]">FIN (VIN)</TableHead>
        <TableHead className="w-[15%]">Status</TableHead>
        <TableHead className="w-[15%]">Infleet Datum</TableHead>
        {isDefleetView && <TableHead className="w-[15%]">Defleet Datum</TableHead>}
        <TableHead className="text-right w-[10%]">Aktionen</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default FleetTableHeader;
