
import React from "react";
import { TableCell } from "@/components/ui/table";
import { ArrowUp, ArrowDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getPreviousMetricData, getChangeDisplay, formatValue, getMetricColorClass } from "./utils";

interface MetricCellProps {
  metric: {
    name: string;
    value: number;
    target: number;
    unit?: string;
    status?: string;
  };
  driverName: string;
  previousWeekData: any;
}

const MetricCell: React.FC<MetricCellProps> = ({ 
  metric, 
  driverName, 
  previousWeekData 
}) => {
  const prevMetric = getPreviousMetricData(driverName, metric.name, previousWeekData);
  const prevValue = prevMetric ? prevMetric.value : null;
  const change = getChangeDisplay(metric.value, prevValue);
  
  // Check if the metric value meets its target (if available)
  const isAtOrBetterThanTarget = metric.target ? 
    (metric.name === "DNR DPMO" ? metric.value <= metric.target : metric.value >= metric.target) : 
    false;
  
  // Determine if change is positive or negative based on metric direction
  const isGoodChange = change && (
    (metric.name === "DNR DPMO" ? change.difference < 0 : change.difference > 0) ||
    (change.difference === 0 && isAtOrBetterThanTarget)
  );
  
  // Get the appropriate color class based on the metric name and value
  const colorClass = getMetricColorClass(metric.name, metric.value);
  
  return (
    <TableCell className="py-2 px-3 text-center">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center gap-1">
          <span className={colorClass}>{formatValue(metric.value, metric.unit || "")}{metric.unit}</span>
          
          {change && prevMetric && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={`text-xs flex items-center ${isGoodChange ? "text-green-500" : "text-red-500"}`}>
                    {isGoodChange ? (
                      <ArrowUp className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-0.5" />
                    )}
                    {change.display}{metric.unit}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Vorwoche: {prevMetric.value}{metric.unit}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </TableCell>
  );
};

export default MetricCell;
