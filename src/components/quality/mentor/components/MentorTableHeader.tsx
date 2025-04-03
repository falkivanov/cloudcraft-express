
import React from "react";
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { SortField } from "../hooks/useMentorDrivers";

interface MentorTableHeaderProps {
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  onSort: (field: SortField) => void;
}

const MentorTableHeader: React.FC<MentorTableHeaderProps> = ({ 
  sortField, 
  sortDirection, 
  onSort 
}) => {
  // Render sort indicator based on current sort state
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />;
    }
    
    return sortDirection === 'asc' 
      ? <ChevronUp className="ml-1 h-4 w-4" />
      : <ChevronDown className="ml-1 h-4 w-4" />;
  };
  
  // Generate a sortable column header
  const SortableHeader = ({ field, label }: { field: SortField, label: string }) => (
    <div 
      className="flex items-center cursor-pointer" 
      onClick={() => onSort(field)}
    >
      {label}
      {renderSortIndicator(field)}
    </div>
  );
  
  return (
    <TableHeader>
      <TableRow className="bg-slate-50">
        <TableHead className="w-[200px]">
          <SortableHeader field="firstName" label="Mentor ID" />
        </TableHead>
        <TableHead className="w-[150px]">
          <SortableHeader field="lastName" label="Last Name" />
        </TableHead>
        <TableHead className="text-center">
          <SortableHeader field="overallRating" label="FICO" />
        </TableHead>
        <TableHead className="text-center">
          <SortableHeader field="station" label="Station" />
        </TableHead>
        <TableHead className="text-right">
          <SortableHeader field="totalTrips" label="Trips" />
        </TableHead>
        <TableHead className="text-right">
          <SortableHeader field="totalKm" label="KM" />
        </TableHead>
        <TableHead className="text-right">
          <SortableHeader field="totalHours" label="Hours" />
        </TableHead>
        <TableHead className="text-center">
          <SortableHeader field="acceleration" label="Accel" />
        </TableHead>
        <TableHead className="text-center">
          <SortableHeader field="braking" label="Braking" />
        </TableHead>
        <TableHead className="text-center">
          <SortableHeader field="cornering" label="Turning" />
        </TableHead>
        <TableHead className="text-center">
          <SortableHeader field="speeding" label="Speed" />
        </TableHead>
        <TableHead className="text-center">
          <SortableHeader field="seatbelt" label="Seatbelt" />
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default MentorTableHeader;
