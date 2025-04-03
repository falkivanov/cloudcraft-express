
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
  const renderHeaderWithTooltip = (text: string, tooltip: string, field: SortField) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className="flex items-center justify-center space-x-1 cursor-pointer" 
            onClick={() => onSort(field)}
          >
            <span>{text}</span>
            <Info className="h-4 w-4 text-muted-foreground" />
            {sortField === field && (
              sortDirection === 'asc' 
                ? <ArrowUp className="h-4 w-4 ml-1" /> 
                : <ArrowDown className="h-4 w-4 ml-1" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const renderSortableHeader = (text: string, field: SortField) => (
    <div 
      className="flex items-center cursor-pointer" 
      onClick={() => onSort(field)}
    >
      <span>{text}</span>
      {sortField === field && (
        sortDirection === 'asc' 
          ? <ArrowUp className="h-4 w-4 ml-1" /> 
          : <ArrowDown className="h-4 w-4 ml-1" />
      )}
    </div>
  );

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
          {renderHeaderWithTooltip("Acceleration", "Harsh acceleration events (Column H)", "acceleration")}
        </TableHead>
        <TableHead className="text-center">
          {renderHeaderWithTooltip("Braking", "Harsh braking events (Column J)", "braking")}
        </TableHead>
        <TableHead className="text-center">
          {renderHeaderWithTooltip("Cornering", "Harsh cornering events (Column L)", "cornering")}
        </TableHead>
        <TableHead className="text-center">
          {renderHeaderWithTooltip("Speeding", "Speeding events (Column N)", "speeding")}
        </TableHead>
        <TableHead className="text-center">
          {renderHeaderWithTooltip("Seatbelt", "Seatbelt usage (Column V)", "seatbelt")}
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default MentorTableHeader;
