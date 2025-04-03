
import React, { useState } from "react";
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { MentorDriverData } from "@/components/file-upload/processors/mentor/types";
import { useMentorDrivers, SortField } from "./hooks/useMentorDrivers";
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
  const [sortField, setSortField] = useState<SortField>("lastName");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const { driversWithNames, hasData } = useMentorDrivers(data, sortField, sortDirection);

  const handleSort = (field: SortField) => {
    // If clicking the same field, toggle direction
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new field, sort ascending by default
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (!hasData) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-auto rounded-md border border-gray-200 shadow">
      <Table>
        <MentorTableHeader 
          sortField={sortField} 
          sortDirection={sortDirection} 
          onSort={handleSort} 
        />
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
