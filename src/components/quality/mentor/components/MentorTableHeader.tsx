
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const MentorTableHeader: React.FC = () => {
  const renderHeaderWithTooltip = (text: string, tooltip: string) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center space-x-1">
            <span>{text}</span>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <TableHeader>
      <TableRow>
        <TableHead>First Name</TableHead>
        <TableHead>Last Name</TableHead>
        <TableHead className="text-center">FICO Score</TableHead>
        <TableHead className="text-center">Station</TableHead>
        <TableHead className="text-right">Trips</TableHead>
        <TableHead className="text-right">KM</TableHead>
        <TableHead className="text-right">Hours</TableHead>
        <TableHead className="text-center">
          {renderHeaderWithTooltip("Acceleration", "Harsh acceleration events (Column H)")}
        </TableHead>
        <TableHead className="text-center">
          {renderHeaderWithTooltip("Braking", "Harsh braking events (Column J)")}
        </TableHead>
        <TableHead className="text-center">
          {renderHeaderWithTooltip("Cornering", "Harsh cornering events (Column L)")}
        </TableHead>
        <TableHead className="text-center">
          {renderHeaderWithTooltip("Speeding", "Speeding events (Column N)")}
        </TableHead>
        <TableHead className="text-center">
          {renderHeaderWithTooltip("Seatbelt", "Seatbelt usage (Column V)")}
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default MentorTableHeader;
