
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SortField } from "../hooks/useMentorDriversTypes";
import { SortIcon } from "./SortIcon";

interface MentorTableHeaderProps {
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  onSort: (field: SortField) => void;
}

const MentorTableHeader: React.FC<MentorTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort
}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead 
          className="w-[250px] cursor-pointer hover:bg-slate-50" 
          onClick={() => onSort('lastName')}
        >
          <div className="flex items-center">
            <span>Fahrer</span>
            {sortField === 'lastName' && <SortIcon direction={sortDirection} />}
          </div>
        </TableHead>
        <TableHead 
          className="text-center cursor-pointer hover:bg-slate-50"
          onClick={() => onSort('overallRating')} 
        >
          <div className="flex items-center justify-center">
            <span>Score</span>
            {sortField === 'overallRating' && <SortIcon direction={sortDirection} />}
          </div>
        </TableHead>
        <TableHead className="text-center">Station</TableHead>
        <TableHead 
          className="text-right cursor-pointer hover:bg-slate-50"
          onClick={() => onSort('totalTrips')}
        >
          <div className="flex items-center justify-end">
            <span>Fahrten</span>
            {sortField === 'totalTrips' && <SortIcon direction={sortDirection} />}
          </div>
        </TableHead>
        <TableHead 
          className="text-right cursor-pointer hover:bg-slate-50"
          onClick={() => onSort('totalKm')}
        >
          <div className="flex items-center justify-end">
            <span>KM</span>
            {sortField === 'totalKm' && <SortIcon direction={sortDirection} />}
          </div>
        </TableHead>
        <TableHead 
          className="text-right cursor-pointer hover:bg-slate-50"
          onClick={() => onSort('totalHours')}
        >
          <div className="flex items-center justify-end">
            <span>Stunden</span>
            {sortField === 'totalHours' && <SortIcon direction={sortDirection} />}
          </div>
        </TableHead>
        <TableHead className="text-center">Beschl.</TableHead>
        <TableHead className="text-center">Bremsen</TableHead>
        <TableHead className="text-center">Kurven</TableHead>
        <TableHead className="text-center">Tempo</TableHead>
        <TableHead className="text-center">Gurt</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default MentorTableHeader;
