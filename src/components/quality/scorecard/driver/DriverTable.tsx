
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DriverKPI } from '../types';
import DriverTableRow from './DriverTableRow';

interface DriverTableProps {
  drivers: DriverKPI[];
}

const DriverTable: React.FC<DriverTableProps> = ({ drivers }) => {
  // Sort drivers alphabetically by name
  const sortedDrivers = [...drivers].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-medium">Fahrer</TableHead>
              <TableHead className="font-medium text-center">Delivered</TableHead>
              <TableHead className="font-medium text-center">DCR</TableHead>
              <TableHead className="font-medium text-center">DNR DPMO</TableHead>
              <TableHead className="font-medium text-center">POD</TableHead>
              <TableHead className="font-medium text-center">CC</TableHead>
              <TableHead className="font-medium text-center">CE</TableHead>
              <TableHead className="font-medium text-center">DEX</TableHead>
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
