
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DriverKPI } from '../types';
import DriverTableRow from './DriverTableRow';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface DriverTableProps {
  drivers: DriverKPI[];
}

// Standard-Metriknamen, die wir erwarten könnten
const expectedMetricColumns = [
  { key: "Delivered", label: "Delivered" },
  { key: "DCR", label: "DCR" },
  { key: "DNR DPMO", label: "DNR DPMO" },
  // LoR DPMO entfernt, da es in KW12 nicht existiert
  { key: "POD", label: "POD" },
  { key: "CC", label: "CC" },
  { key: "CE", label: "CE" },
  { key: "DEX", label: "DEX" },
  { key: "CDF", label: "CDF" },
];

// Metriken, die immer angezeigt werden sollen, auch wenn sie in den Daten fehlen
const alwaysShowMetrics = ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];

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
  
  // Ermittle dynamisch die tatsächlich vorhandenen Metriken aus allen Fahrern
  const availableMetricColumns = useMemo(() => {
    if (drivers.length === 0) return expectedMetricColumns.filter(col => 
      alwaysShowMetrics.includes(col.key)
    );
    
    // Sammle alle eindeutigen Metriknamen aus allen Fahrern
    const metricNames = new Set<string>();
    drivers.forEach(driver => {
      driver.metrics.forEach(metric => {
        metricNames.add(metric.name);
      });
    });
    
    // Füge immer anzuzeigende Metriken hinzu, auch wenn sie in den Daten fehlen
    alwaysShowMetrics.forEach(metric => {
      metricNames.add(metric);
    });
    
    // Sortiere die Spalten gemäß der erwarteten Reihenfolge, falls vorhanden
    return expectedMetricColumns
      .filter(col => metricNames.has(col.key))
      .map(col => ({ key: col.key, label: col.label }));
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
                  key={metric.key}
                  className="font-medium text-center cursor-pointer select-none"
                  onClick={() => handleSort(metric.key)}
                >
                  {metric.label}
                  {renderSortIcon(metric.key)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDrivers.map((driver) => (
              <DriverTableRow key={driver.name} driver={driver} availableMetrics={availableMetricColumns.map(m => m.key)} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DriverTable;
