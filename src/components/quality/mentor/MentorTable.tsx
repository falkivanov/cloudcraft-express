
import React from "react";
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { MentorDriverData } from "@/components/file-upload/processors/mentor/types";
import { useMentorDrivers } from "./hooks/useMentorDrivers";
import MentorTableHeader from "./components/MentorTableHeader";
import MentorTableRow from "./components/MentorTableRow";
import EmptyState from "./components/EmptyState";

interface MentorTableProps {
  data: {
    weekNumber: number;
    year: number;
    drivers: MentorDriverData[];
  } | null;
}

const MentorTable: React.FC<MentorTableProps> = ({ data }) => {
  const { driversWithNames, hasData } = useMentorDrivers(data);

  if (!hasData) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-auto rounded-md border">
      <Table>
        <MentorTableHeader />
        <TableBody>
          {driversWithNames.map((driver, index) => (
            <MentorTableRow key={index} driver={driver} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MentorTable;
