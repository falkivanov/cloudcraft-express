
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Truck } from "lucide-react";

interface EmptyStateProps {
  isDefleetView: boolean;
}

const EmptyState = ({ isDefleetView }: EmptyStateProps) => {
  return (
    <TableRow>
      <TableCell colSpan={isDefleetView ? 8 : 7} className="h-32 text-center">
        <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
          <Truck className="h-10 w-10 opacity-20" />
          <p>Keine Fahrzeuge gefunden</p>
          <p className="text-sm">
            {isDefleetView 
              ? "Es wurden noch keine Fahrzeuge aus dem Fuhrpark entfernt." 
              : "Keine Fahrzeuge entsprechen den Filterkriterien."}
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default EmptyState;
