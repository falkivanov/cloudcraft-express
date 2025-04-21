
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DriverKPI } from '../types';
import DriverTableRow from './DriverTableRow';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface DriverTableProps {
  drivers: DriverKPI[];
}

const metricColumns = [
  { key: "Delivered", label: "Delivered" },
  { key: "DCR", label: "DCR" },
  { key: "DNR DPMO", label: "DNR DPMO" },
  { key: "POD", label: "POD" },
  { key: "CC", label: "CC" },
  { key: "CE", label: "CE" },
  { key: "DEX", label: "DEX" },
];

type SortColumn = "name" | typeof metricColumns[number]["key"];
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
              {metricColumns.map(metric => (
                <TableHead
                  key={metric.key}
                  className="font-medium text-center cursor-pointer select-none"
                  onClick={() => handleSort(metric.key as SortColumn)}
                >
                  {metric.label}
                  {renderSortIcon(metric.key as SortColumn)}
                </TableHead>
              ))}
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
