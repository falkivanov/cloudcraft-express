import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DriverKPI } from "../types";
import DriverTableRow from "./DriverTableRow";
import { ArrowDown, ArrowUp } from "lucide-react";

interface DriverTableProps {
  drivers: DriverKPI[];
}

const DriverTable: React.FC<DriverTableProps> = ({ drivers }) => {
  // Initialize with sorting by score in descending order (best on top)
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  }>({ key: 'score', direction: 'descending' });

  if (drivers.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        Keine Fahrer in dieser Kategorie vorhanden
      </div>
    );
  }

  // Create a sorted copy of the drivers array
  const sortedDrivers = React.useMemo(() => {
    let sortableDrivers = [...drivers];
    if (sortConfig !== null) {
      sortableDrivers.sort((a, b) => {
        // Sort by driver name
        if (sortConfig.key === 'name') {
          if (a.name < b.name) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (a.name > b.name) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }
        
        // Sort by score with delivered packages tiebreaker
        if (sortConfig.key === 'score') {
          const scoreA = a.score?.total || 0;
          const scoreB = b.score?.total || 0;
          
          // If scores are equal, use delivered packages as a tiebreaker
          if (scoreA === scoreB) {
            // Look for "Delivered" metric value
            const deliveredA = a.metrics.find(m => m.name === 'Delivered')?.value || 0;
            const deliveredB = b.metrics.find(m => m.name === 'Delivered')?.value || 0;
            return sortConfig.direction === 'ascending' 
              ? deliveredA - deliveredB 
              : deliveredB - deliveredA;
          }
          
          return sortConfig.direction === 'ascending' 
            ? scoreA - scoreB 
            : scoreB - scoreA;
        }
        
        // Sort by metric values
        const metricA = a.metrics.find(m => m.name === sortConfig.key)?.value || 0;
        const metricB = b.metrics.find(m => m.name === sortConfig.key)?.value || 0;
        
        // For DNR DPMO, lower is better so we reverse the sorting
        if (sortConfig.key === 'DNR DPMO') {
          return sortConfig.direction === 'ascending' 
            ? metricA - metricB 
            : metricB - metricA;
        }
        
        return sortConfig.direction === 'ascending' 
          ? metricB - metricA 
          : metricA - metricB;
      });
    }
    return sortableDrivers;
  }, [drivers, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortDirection = (name: string) => {
    if (!sortConfig || sortConfig.key !== name) {
      return null;
    }
    return sortConfig.direction;
  };

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="py-1 px-3 text-xs text-gray-500 cursor-pointer"
              onClick={() => requestSort('name')}
            >
              <div className="flex items-center gap-1">
                Fahrer
                {getSortDirection('name') === 'ascending' && <ArrowUp className="h-3 w-3" />}
                {getSortDirection('name') === 'descending' && <ArrowDown className="h-3 w-3" />}
              </div>
            </TableHead>
            
            {/* Score column */}
            <TableHead 
              className="py-1 px-3 text-center text-xs text-gray-500 cursor-pointer"
              onClick={() => requestSort('score')}
            >
              <div className="flex items-center justify-center gap-1">
                Score
                {getSortDirection('score') === 'ascending' && <ArrowUp className="h-3 w-3" />}
                {getSortDirection('score') === 'descending' && <ArrowDown className="h-3 w-3" />}
              </div>
            </TableHead>
            
            {drivers[0].metrics.map((metric) => (
              <TableHead 
                key={metric.name} 
                className="py-1 px-3 text-center text-xs text-gray-500 cursor-pointer"
                onClick={() => requestSort(metric.name)}
              >
                <div className="flex items-center justify-center gap-1">
                  {metric.name}
                  {getSortDirection(metric.name) === 'ascending' && <ArrowUp className="h-3 w-3" />}
                  {getSortDirection(metric.name) === 'descending' && <ArrowDown className="h-3 w-3" />}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDrivers.map((driver) => (
            <DriverTableRow 
              key={driver.name} 
              driver={driver} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DriverTable;
