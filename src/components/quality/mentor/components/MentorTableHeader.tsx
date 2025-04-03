
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, ArrowUp, ArrowDown } from "lucide-react";

type SortField = 
  | "firstName" 
  | "lastName" 
  | "overallRating" 
  | "station" 
  | "totalTrips" 
  | "totalKm" 
  | "totalHours" 
  | "acceleration" 
  | "braking" 
  | "cornering" 
  | "speeding" 
  | "seatbelt";

interface MentorTableHeaderProps {
  sortField: SortField | null;
  sortDirection: 'asc' | 'desc';
  onSort: (field: SortField) => void;
}

const MentorTableHeader: React.FC<MentorTableHeaderProps> = ({ 
  sortField, 
  sortDirection, 
  onSort 
}) => {
  const renderSortableHeader = (text: string, field: SortField, tooltip?: string) => {
    const sortIcon = sortField === field && (
      sortDirection === 'asc' 
        ? <ArrowUp className="h-4 w-4 ml-1" /> 
        : <ArrowDown className="h-4 w-4 ml-1" />
    );

    const headerContent = (
      <div 
        className="flex items-center cursor-pointer" 
        onClick={() => onSort(field)}
      >
        <span>{text}</span>
        {sortIcon}
      </div>
    );

    return tooltip ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{headerContent}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : headerContent;
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead>{renderSortableHeader("First Name", "firstName")}</TableHead>
        <TableHead>{renderSortableHeader("Last Name", "lastName")}</TableHead>
        <TableHead className="text-center">{renderSortableHeader("FICO Score", "overallRating")}</TableHead>
        <TableHead className="text-center">{renderSortableHeader("Station", "station")}</TableHead>
        <TableHead className="text-right">{renderSortableHeader("Trips", "totalTrips")}</TableHead>
        <TableHead className="text-right">{renderSortableHeader("KM", "totalKm")}</TableHead>
        <TableHead className="text-right">{renderSortableHeader("Hours", "totalHours")}</TableHead>
        <TableHead className="text-center">
          {renderSortableHeader(
            "Acceleration", 
            "acceleration", 
            "Harsh acceleration events (Column H)"
          )}
        </TableHead>
        <TableHead className="text-center">
          {renderSortableHeader(
            "Braking", 
            "braking", 
            "Harsh braking events (Column J)"
          )}
        </TableHead>
        <TableHead className="text-center">
          {renderSortableHeader(
            "Cornering", 
            "cornering", 
            "Harsh cornering events (Column L)"
          )}
        </TableHead>
        <TableHead className="text-center">
          {renderSortableHeader(
            "Speeding", 
            "speeding", 
            "Speeding events (Column N)"
          )}
        </TableHead>
        <TableHead className="text-center">
          {renderSortableHeader(
            "Seatbelt", 
            "seatbelt", 
            "Seatbelt usage (Column V)"
          )}
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default MentorTableHeader;
