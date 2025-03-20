
import React, { useState, useEffect } from "react";
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
import { initialEmployees } from "@/data/sampleEmployeeData";

interface DriverTableProps {
  drivers: DriverKPI[];
}

const DriverTable: React.FC<DriverTableProps> = ({ drivers }) => {
  // Initialize with sorting by score in descending order (best on top)
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  }>({ key: 'score', direction: 'descending' });
  
  // Create a state for processed drivers with translated names
  const [processedDrivers, setProcessedDrivers] = useState<DriverKPI[]>([]);
  
  // Map transporterIds to full employee names
  useEffect(() => {
    // Function to replace transporter IDs with actual employee names
    const mapTransporterIdsToNames = (driverList: DriverKPI[]): DriverKPI[] => {
      // Create a map of transporterId to employee name
      const transporterIdToName = new Map();
      initialEmployees.forEach(employee => {
        transporterIdToName.set(employee.transporterId, employee.name);
      });
      
      // Map drivers using the lookup
      return driverList.map(driver => {
        // Check if the driver name looks like a transporter ID (e.g., TR-001)
        const transporterIdMatch = driver.name.match(/^TR-\d+$/i);
        
        if (transporterIdMatch && transporterIdToName.has(driver.name)) {
          // Replace transporter ID with the actual employee name
          return {
            ...driver,
            name: transporterIdToName.get(driver.name),
            originalId: driver.name // Keep original ID for reference if needed
          };
        }
        
        return driver;
      });
    };
    
    // Process and update drivers list
    const transformedDrivers = mapTransporterIdsToNames(drivers);
    setProcessedDrivers(transformedDrivers);
  }, [drivers]);

  if (processedDrivers.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        Keine Fahrer in dieser Kategorie vorhanden
      </div>
    );
  }

  // Create a sorted copy of the drivers array
  const sortedDrivers = React.useMemo(() => {
    let sortableDrivers = [...processedDrivers];
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
  }, [processedDrivers, sortConfig]);

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
