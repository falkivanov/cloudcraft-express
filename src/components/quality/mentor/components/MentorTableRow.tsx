
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getRatingBackground, getScoreDisplay } from "../utils/displayUtils";
import { MentorDriverData } from "@/components/file-upload/processors/mentor/types";

interface MentorTableRowProps {
  driver: MentorDriverData & {
    employeeName?: string;
    transporterId?: string;
  };
}

const MentorTableRow: React.FC<MentorTableRowProps> = ({ driver }) => {
  // Split the name into first and last name if we have both parts
  const firstName = driver.firstName || "";
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
      // Otherwise just show as decimal
      return hours.toFixed(2);
    }
    
    // Check if hours is a time string in format hh:mm
    if (typeof hours === 'string') {
      // If it contains a colon, assume it's already in HH:MM format
      if (hours.includes(':')) return hours;
      
      // Try to parse as a number
      const numericValue = parseFloat(hours);
      if (!isNaN(numericValue)) {
        if (numericValue > 1000) {
          const totalMinutes = Math.floor(numericValue / 60);
          const hours24 = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          return `${hours24}:${minutes.toString().padStart(2, '0')}`;
        }
        return numericValue.toFixed(2);
      }
    }
    
    return String(hours || "-");
  };

  // Helper function to display risk values properly
  const displayRiskValue = (value: string | undefined): React.ReactNode => {
    if (!value || value === "-" || value === "Unknown") {
      return <span>-</span>;
    }
    return (
      <Badge variant="outline" className={getRatingBackground(value)}>
        {value}
      </Badge>
    );
  };
  
  return (
    <TableRow className="hover:bg-slate-50">
      <TableCell className="font-medium">{firstName}</TableCell>
      <TableCell className="font-medium">{lastName}</TableCell>
      <TableCell className="text-center">{getScoreDisplay(driver.overallRating)}</TableCell>
      <TableCell className="text-center">{driver.station}</TableCell>
      <TableCell className="text-right">{driver.totalTrips}</TableCell>
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
    </TableRow>
  );
};

export default MentorTableRow;
