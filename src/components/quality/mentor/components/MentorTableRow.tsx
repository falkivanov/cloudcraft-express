import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getRatingBackground, getScoreDisplay } from "../utils/displayUtils";
import { MentorDriverData } from "@/components/file-upload/processors/mentor/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MentorTableRowProps {
  driver: MentorDriverData & {
    employeeName?: string;
    transporterId?: string;
  };
}

const MentorTableRow: React.FC<MentorTableRowProps> = ({ driver }) => {
  const formatHours = (hours: number | string): string => {
    if (typeof hours === 'number') {
      if (hours > 1000) {
        const totalMinutes = Math.floor(hours / 60);
        const hours24 = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours24}:${minutes.toString().padStart(2, '0')}`;
      }
      if (hours === 0) return "0.00";
      return hours.toFixed(2);
    }
    
    if (typeof hours === 'string' && hours.includes(':')) return hours;
    
    if (!hours || hours === '-') return "0.00";
    
    const numericValue = parseFloat(hours.toString());
    if (!isNaN(numericValue)) {
      if (numericValue === 0) return "0.00";
      if (numericValue > 1000) {
        const totalMinutes = Math.floor(numericValue / 60);
        const hours24 = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours24}:${minutes.toString().padStart(2, '0')}`;
      }
      return numericValue.toFixed(2);
    }
    
    return String(hours);
  };

  const displayRiskValue = (value: string | undefined): React.ReactNode => {
    if (!value || value === "-" || value === "Unknown") {
      return <span>-</span>;
    }
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={getRatingBackground(value)}>
              {value}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{value}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };
  
  const formatNumericValue = (value: number | undefined): string => {
    if (value === undefined || value === null) return "-";
    if (value === 0) return "0";
    return String(value);
  };
  
  return (
    <TableRow className="hover:bg-slate-50">
      <TableCell className="font-medium">
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  {driver.employeeName ? (
                    <span className="font-semibold text-black truncate max-w-[200px]">
                      {driver.employeeName}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">ID fehlt</span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {driver.employeeName ? (
                  <div className="max-w-xs">
                    <p className="font-medium">Mitarbeiter: {driver.employeeName}</p>
                    <p className="text-xs text-muted-foreground mt-1">Mentor ID: {driver.firstName}</p>
                    {driver.transporterId && (
                      <p className="text-xs text-muted-foreground">Transporter ID: {driver.transporterId}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p>Anonymisierte ID - Kein Mitarbeiter gefunden</p>
                    <p className="text-xs text-muted-foreground mt-1">ID: {driver.firstName}</p>
                    <p className="text-xs text-muted-foreground mt-1">Bearbeiten Sie die Mitarbeiterdaten und fügen Sie diese Mentor-ID hinzu</p>
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
      <TableCell className="text-center">{getScoreDisplay(driver.overallRating)}</TableCell>
      <TableCell className="text-center">{driver.station}</TableCell>
      <TableCell className="text-center">{formatNumericValue(driver.totalTrips)}</TableCell>
      <TableCell className="text-center">{driver.totalKm > 0 ? Number(driver.totalKm).toFixed(2) : "-"}</TableCell>
      <TableCell className="text-center">
        {formatHours(driver.totalHours)}
      </TableCell>
      <TableCell className="text-center whitespace-nowrap">
        {displayRiskValue(driver.acceleration)}
      </TableCell>
      <TableCell className="text-center whitespace-nowrap">
        {displayRiskValue(driver.braking)}
      </TableCell>
      <TableCell className="text-center whitespace-nowrap">
        {displayRiskValue(driver.cornering)}
      </TableCell>
      <TableCell className="text-center whitespace-nowrap">
        {displayRiskValue(driver.speeding)}
      </TableCell>
      <TableCell className="text-center whitespace-nowrap">
        {displayRiskValue(driver.seatbelt)}
      </TableCell>
    </TableRow>
  );
}

export default MentorTableRow;
