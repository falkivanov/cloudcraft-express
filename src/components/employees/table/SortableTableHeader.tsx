
import React from "react";
import { TableHead } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";

type SortField = "name" | "startDate" | "workingDaysAWeek" | "preferredVehicle";

interface SortableTableHeaderProps {
  field: SortField;
  currentSortField: SortField;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
}

const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({
  field,
  currentSortField,
  onSort,
  children
}) => {
  return (
    <TableHead 
      className="cursor-pointer hover:bg-gray-50"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <ArrowUpDown className={`h-4 w-4 ${currentSortField === field ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
    </TableHead>
  );
};

export default SortableTableHeader;
