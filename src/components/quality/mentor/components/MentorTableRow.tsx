
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { getRiskColor, getScoreDisplay } from "../utils/displayUtils";
import { MentorDriverData } from "@/components/file-upload/processors/mentor/types";

interface MentorTableRowProps {
  driver: MentorDriverData & {
    employeeName: string;
    transporterId: string;
  };
}

const MentorTableRow: React.FC<MentorTableRowProps> = ({ driver }) => {
  return (
    <TableRow className="hover:bg-slate-50">
      <TableCell className="font-medium">{driver.employeeName}</TableCell>
      <TableCell>{driver.station}</TableCell>
      <TableCell className="text-right">{driver.totalTrips}</TableCell>
      <TableCell className="text-right">{driver.totalHours}</TableCell>
      <TableCell className={`text-center ${getRiskColor(driver.acceleration)}`}>
        {driver.acceleration || "-"}
      </TableCell>
      <TableCell className={`text-center ${getRiskColor(driver.braking)}`}>
        {driver.braking || "-"}
      </TableCell>
      <TableCell className={`text-center ${getRiskColor(driver.cornering)}`}>
        {driver.cornering || "-"}
      </TableCell>
      <TableCell className={`text-center ${getRiskColor(driver.distraction)}`}>
        {driver.distraction || "-"}
      </TableCell>
      <TableCell className={`text-center ${getRiskColor(driver.seatbelt)}`}>
        {driver.seatbelt || "-"}
      </TableCell>
      <TableCell className={`text-center ${getRiskColor(driver.speeding)}`}>
        {driver.speeding || "-"}
      </TableCell>
      <TableCell className={`text-center ${getRiskColor(driver.following)}`}>
        {driver.following || "-"}
      </TableCell>
      <TableCell className="text-center">
        {getScoreDisplay(driver.overallRating)}
      </TableCell>
    </TableRow>
  );
};

export default MentorTableRow;
