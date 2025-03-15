
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";

interface EmptyStateProps {
  isDefleetView: boolean;
}

const EmptyState = ({ isDefleetView }: EmptyStateProps) => {
  return (
    <TableRow>
      <TableCell colSpan={isDefleetView ? 8 : 7} className="h-32 text-center text-muted-foreground">
        Keine Fahrzeuge gefunden
      </TableCell>
    </TableRow>
  );
};

export default EmptyState;
