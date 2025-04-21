import React, { useEffect, useState } from "react";
import { TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface MetricCellProps {
  metricName: string;
  value: number;
  unit?: string;
}

interface DriverKpiTarget {
  name: string;
  scoreTarget: number;
  colorTarget: number;
  unit?: string;
}

const MetricCell: React.FC<MetricCellProps> = ({ metricName, value, unit }) => {
  const [targets, setTargets] = useState<DriverKpiTarget[]>([]);
  
  useEffect(() => {
    try {
      const storedTargets = localStorage.getItem("scorecard_driver_targets");
      if (storedTargets) {
        const parsedTargets = JSON.parse(storedTargets);
        setTargets(parsedTargets);
      }
    } catch (e) {
      console.error("Error loading driver KPI targets:", e);
    }
    
    const handleTargetsUpdated = () => {
      try {
        const updatedTargets = localStorage.getItem("scorecard_driver_targets");
        if (updatedTargets) {
          const parsedTargets = JSON.parse(updatedTargets);
          setTargets(parsedTargets);
        }
      } catch (e) {
        console.error("Error loading updated driver KPI targets:", e);
      }
    };
    
    window.addEventListener('scorecard_driver_targets_updated', handleTargetsUpdated);
    
    return () => {
      window.removeEventListener('scorecard_driver_targets_updated', handleTargetsUpdated);
    };
  }, []);

  let displayValue;
  
  if (value === 0 && metricName !== "DNR DPMO" && metricName !== "CE" && metricName !== "Delivered") {
    displayValue = "-";
  } else if (metricName === "DNR DPMO") {
    displayValue = Math.round(value).toString();
  } else if (metricName === "Delivered" || metricName === "CE") {
    displayValue = Math.round(value).toString();
  } else if (unit === "%") {
    if (value <= 1 && value > 0) {
      displayValue = `${(value * 100).toFixed(1)}%`;
    } else if (value > 1 && value <= 100) {
      displayValue = `${value.toFixed(1)}%`;
    } else if (value > 100) {
      displayValue = `${(value / 100).toFixed(1)}%`;
    } else {
      displayValue = `${value}%`;
    }
  } else {
    displayValue = `${value}${unit || ''}`;
  }

  const colorClass = getMetricColorClass(metricName, value, targets);
  
  return (
    <TableCell className={cn("py-2 px-3 text-sm text-center font-medium", colorClass)}>
      {displayValue}
    </TableCell>
  );
};

function getMetricColorClass(metricName: string, value: number, targets: DriverKpiTarget[]): string {
  if (value === 0 && metricName !== "DNR DPMO" && metricName !== "CE" && metricName !== "Delivered") {
    return "text-gray-400";
  }
  
  const target = targets.find(t => t.name === metricName);
  
  if (!target) {
    switch (metricName) {
      case "DCR":
        if (value >= 99.5) return "text-blue-600";
        if (value >= 98) return "text-orange-500";
        return "text-red-500";
        
      case "DNR DPMO":
        if (value <= 1000) return "text-blue-600";
        if (value <= 1600) return "text-orange-500";
        return "text-red-500";
        
      case "POD":
        if (value >= 99) return "text-blue-600";
        if (value >= 97) return "text-orange-500";
        return "text-red-500";
        
      case "CC":
        if (value === 0) return "text-gray-400";
        if (value >= 99) return "text-blue-600";
        if (value >= 94) return "text-orange-500";
        return "text-red-500";
        
      case "CE":
        if (value === 0) return "text-blue-600";
        return "text-red-500";
        
      case "DEX":
        if (value >= 95) return "text-blue-600";
        if (value >= 90) return "text-orange-500";
        return "text-red-500";
        
      default:
        return "text-gray-700";
    }
  }
  
  switch (metricName) {
    case "DCR":
      if (value >= target.scoreTarget) return "text-blue-600";
      if (value >= target.colorTarget) return "text-orange-500";
      return "text-red-500";
      
    case "DNR DPMO":
      if (value <= target.scoreTarget) return "text-blue-600";
      if (value <= target.colorTarget) return "text-orange-500";
      return "text-red-500";
      
    case "POD":
      if (value >= target.scoreTarget) return "text-blue-600";
      if (value >= target.colorTarget) return "text-orange-500";
      return "text-red-500";
      
    case "CC":
      if (value === 0) return "text-gray-400";
      if (value >= target.scoreTarget) return "text-blue-600";
      if (value >= target.colorTarget) return "text-orange-500";
      return "text-red-500";
      
    case "CE":
      if (value === 0) return "text-blue-600";
      return "text-red-500";
      
    case "DEX":
      if (value >= target.scoreTarget) return "text-blue-600";
      if (value >= target.colorTarget) return "text-orange-500";
      return "text-red-500";
      
    default:
      return "text-gray-700";
  }
}

export default MetricCell;
