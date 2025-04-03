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
    return String(hours || "-");
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
        <Badge variant="outline" className={getRatingBackground(driver.acceleration)}>
          {driver.acceleration || "-"}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline" className={getRatingBackground(driver.braking)}>
          {driver.braking || "-"}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline" className={getRatingBackground(driver.cornering)}>
          {driver.cornering || "-"}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline" className={getRatingBackground(driver.distraction)}>
          {driver.distraction || "-"}
        </Badge>
      </TableCell>
    </TableRow>
  );
};

export default MentorTableRow;
