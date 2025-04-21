
import React from "react";
import { TableCell, TableRow } from '@/components/ui/table';
import { DriverKPI } from '../types';

interface DriverTableRowProps {
  driver: DriverKPI;
  metricColumns: string[];
}

const DriverTableRow: React.FC<DriverTableRowProps> = ({ driver, metricColumns }) => {
  // Hilfsfunktion, um einen Metrikwert formatiert zurückzugeben
  const getFormattedMetricValue = (metricName: string) => {
    const metric = driver.metrics.find(m => m.name === metricName);
    
    if (!metric) return "-";
    if (metric.status === "none") return "-";
    
    // Formatiere den Wert basierend auf der Einheit
    if (metric.unit === "%") {
      return `${metric.value.toFixed(1)}%`;
    } else if (metric.unit === "DPMO") {
      return metric.value.toFixed(0);
    } else {
      return metric.value.toString();
    }
  };
  
  // Hilfsfunktion, um die CSS-Klasse basierend auf dem Status zu bestimmen
  const getStatusClass = (metricName: string) => {
    const metric = driver.metrics.find(m => m.name === metricName);
    if (!metric) return "";
    
    switch (metric.status) {
      case "fantastic": return "text-blue-600 font-semibold";
      case "great": return "text-green-600";
      case "fair": return "text-amber-600";
      case "poor": return "text-red-600";
      default: return "";
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{driver.name}</TableCell>
      
      {/* Dynamisch generierte Zellen basierend auf den vorhandenen Metriken */}
      {metricColumns.map(metricName => (
        <TableCell 
          key={metricName} 
          className={`text-center ${getStatusClass(metricName)}`}
        >
          {getFormattedMetricValue(metricName)}
        </TableCell>
      ))}
    </TableRow>
  );
};

export default DriverTableRow;
