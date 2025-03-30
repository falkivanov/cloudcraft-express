
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DriverKPI } from '../types';
import DriverTableRow from './DriverTableRow';
import { calculateDriverScore } from './utils';

interface DriverTableProps {
  drivers: DriverKPI[];
}

const DriverTable: React.FC<DriverTableProps> = ({ drivers }) => {
  // Sort drivers by score (descending) but ensure we calculate scores for all first
  const sortedDrivers = [...drivers]
    .map(driver => ({
      ...driver,
      scoreCalc: driver.score || calculateDriverScore(driver)
    }))
    .sort((a, b) => b.scoreCalc.total - a.scoreCalc.total);

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-medium">Fahrer</TableHead>
              <TableHead className="font-medium text-right">Score</TableHead>
              <TableHead className="font-medium">Delivered</TableHead>
              <TableHead className="font-medium">DCR</TableHead>
              <TableHead className="font-medium">DNR DPMO</TableHead>
              <TableHead className="font-medium">POD</TableHead>
              <TableHead className="font-medium">CC</TableHead>
              <TableHead className="font-medium">CE</TableHead>
              <TableHead className="font-medium">DEX</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDrivers.map((driver) => (
              <DriverTableRow key={driver.name} driver={driver} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DriverTable;
