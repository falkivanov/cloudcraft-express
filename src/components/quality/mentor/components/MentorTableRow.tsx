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
  // Default to showing the anonymized ID as-is
  const firstName = driver.firstName || "Driver";
  const lastName = driver.lastName || "";
  
  // Format hours correctly
  const formatHours = (hours: number | string): string => {
    if (typeof hours === 'number') {
      // Format as HH:MM if it's a large number (likely seconds)
      if (hours > 1000) {
        const totalMinutes = Math.floor(hours / 60);
        const hours24 = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours24}:${minutes.toString().padStart(2, '0')}`;
      }
      // If it's 0, show 0.00
      if (hours === 0) return "0.00";
      // Otherwise just show as decimal
      return hours.toFixed(2);
    }
    
    // If it's a timestamp format, show as-is
    if (typeof hours === 'string' && hours.includes(':')) return hours;
    
    // If it's empty or "-", show 0.00
    if (!hours || hours === '-') return "0.00";
    
    // Try to parse as a number
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

  // Helper function to display risk values properly with tooltip
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
  
  // Format for numerical values
  const formatNumericValue = (value: number | undefined): string => {
    if (value === undefined || value === null) return "-";
    if (value === 0) return "0";
    return String(value);
  };
  
  return (
    <TableRow className="hover:bg-slate-50">
      <TableCell className="font-medium">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                {driver.employeeName ? (
                  <span className="text-green-700 font-medium">{driver.employeeName}</span>
                ) : (
                  <span className="italic text-muted-foreground">{firstName}</span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {driver.employeeName ? (
                <div className="max-w-xs">
                  <p className="font-medium">Matched with employee: {driver.employeeName}</p>
                  <p className="text-xs text-muted-foreground mt-1">Original Mentor ID: {firstName}</p>
                </div>
              ) : (
                <p>Anonymized ID - No employee match found</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className="font-medium">{lastName}</TableCell>
      <TableCell className="text-center">{getScoreDisplay(driver.overallRating)}</TableCell>
      <TableCell className="text-center">{driver.station}</TableCell>
      <TableCell className="text-right">{formatNumericValue(driver.totalTrips)}</TableCell>
      <TableCell className="text-right">{driver.totalKm > 0 ? Number(driver.totalKm).toFixed(2) : "-"}</TableCell>
      <TableCell className="text-right">
        {formatHours(driver.totalHours)}
      </TableCell>
      <TableCell className="text-center">
        {displayRiskValue(driver.acceleration)}
      </TableCell>
      <TableCell className="text-center">
        {displayRiskValue(driver.braking)}
      </TableCell>
      <TableCell className="text-center">
        {displayRiskValue(driver.cornering)}
      </TableCell>
      <TableCell className="text-center">
        {displayRiskValue(driver.speeding)}
      </TableCell>
      <TableCell className="text-center">
        {displayRiskValue(driver.seatbelt)}
      </TableCell>
    </TableRow>
  );
}

export default MentorTableRow;
