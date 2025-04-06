
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, User } from "lucide-react";
import { GroupedConcession } from "../types";
import { formatCurrency } from "../utils";

interface ConcessionsTableRowProps {
  group: GroupedConcession;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const ConcessionsTableRow: React.FC<ConcessionsTableRowProps> = ({
  group,
  isExpanded,
  onToggleExpand
}) => {
  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/80"
      onClick={onToggleExpand}
    >
      <TableCell className="p-2">
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </TableCell>
      <TableCell className="font-medium flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        {group.driverName}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {group.transportId}
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{group.count}</Badge>
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(group.totalCost)}
      </TableCell>
    </TableRow>
  );
};

export default ConcessionsTableRow;
