
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";

interface ConcessionsEmptyStateProps {
  searchTerm: string;
}

const ConcessionsEmptyState: React.FC<ConcessionsEmptyStateProps> = ({ searchTerm }) => {
  return (
    <TableRow>
      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
        {searchTerm ? 'Keine Ergebnisse gefunden' : 'Keine Daten vorhanden'}
      </TableCell>
    </TableRow>
  );
};

export default ConcessionsEmptyState;
