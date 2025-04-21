
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DriverKPI } from '../types';
import DriverTableRow from './DriverTableRow';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface DriverTableProps {
  drivers: DriverKPI[];
}

type SortColumn = "name" | string;
type SortDirection = "asc" | "desc";

// Hilfsfunktion um den KPI Wert anhand Spaltennamen zu holen
function getMetricValue(driver: DriverKPI, metricName: string) {
  const m = driver.metrics.find(m => m.name === metricName);
  // Die Metric kann undefined sein (extreme edge cases), dann mit -Infinity/'' sortieren
  return m ? m.value : -Infinity;
}

const DriverTable: React.FC<DriverTableProps> = ({ drivers }) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  
  // Dynamisch alle verfügbaren Metriken aus den Fahrerdaten sammeln
  const availableMetricColumns = useMemo(() => {
    if (drivers.length === 0) return [];
    
    // Alle eindeutigen Metriknamen aus allen Fahrern sammeln
    const metricNames = new Set<string>();
    drivers.forEach(driver => {
      driver.metrics.forEach(metric => {
        metricNames.add(metric.name);
      });
    });
    
    // In Array umwandeln und alphabetisch sortieren (könnte später angepasst werden)
    return Array.from(metricNames).sort();
  }, [drivers]);

  // Sortierfunktion für Fahrer
  const sortedDrivers = useMemo(() => {
    const sorted = [...drivers];
    if (sortColumn === "name") {
      sorted.sort((a, b) => {
        const compare = a.name.localeCompare(b.name, "de", { sensitivity: "base" });
        return sortDirection === "asc" ? compare : -compare;
      });
    } else {
      sorted.sort((a, b) => {
        const va = getMetricValue(a, sortColumn);
        const vb = getMetricValue(b, sortColumn);
        if (isNaN(va) || va === -Infinity) return 1;
        if (isNaN(vb) || vb === -Infinity) return -1;
        if (va === vb) {
          // Bei Gleichstand Fallback auf Name
          return a.name.localeCompare(b.name, "de", { sensitivity: "base" });
        }
        return sortDirection === "asc" ? va - vb : vb - va;
      });
    }
    return sorted;
  }, [drivers, sortColumn, sortDirection]);

  // Sortiersymbol herausfinden
  function renderSortIcon(col: SortColumn) {
    if (sortColumn !== col) return null;
    return sortDirection === "asc"
      ? <ArrowUp className="inline ml-1 w-3 h-3" />
      : <ArrowDown className="inline ml-1 w-3 h-3" />;
  }

  // Beim Klick Sortierspalte und Richtung umschalten
  function handleSort(col: SortColumn) {
    if (sortColumn === col) {
      setSortDirection(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection(col === "name" ? "asc" : "desc"); // Default bei KPI-Columns: absteigend
    }
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead
                className="font-medium cursor-pointer select-none" 
                onClick={() => handleSort("name")}
              >
                Fahrer
                {renderSortIcon("name")}
              </TableHead>
              {availableMetricColumns.map(metric => (
                <TableHead
                  key={metric}
                  className="font-medium text-center cursor-pointer select-none"
                  onClick={() => handleSort(metric)}
                >
                  {metric}
                  {renderSortIcon(metric)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDrivers.map((driver) => (
              <DriverTableRow 
                key={driver.name} 
                driver={driver} 
                availableMetrics={availableMetricColumns} 
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DriverTable;
