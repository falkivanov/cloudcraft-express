
import React from "react";
import { ScorecardKPI } from "./types";
import { TableCell, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getStatusClass, getPreviousWeekKPI, getChangeDisplay, formatKPIValue } from "./company/utils";

interface KPITableRowProps {
  kpi: ScorecardKPI;
  previousWeekData: any;
}

const KPITableRow: React.FC<KPITableRowProps> = ({ kpi, previousWeekData }) => {
  const previousKPI = getPreviousWeekKPI(kpi.name, previousWeekData);
  const change = getChangeDisplay(kpi.value, previousKPI);
  
  // Special handling for BOC
  const isBOC = kpi.name === "Breach of Contract (BOC)";
  
  // For BOC, display status text instead of value
  const displayValue = isBOC 
    ? "" 
    : formatKPIValue(kpi.value, kpi.unit);
  
  // For BOC, display "none" or "not in compliance" instead of fantastic/poor
  const displayStatus = isBOC 
    ? (kpi.status === "none" ? "none" : "not in compliance") 
    : kpi.status;

  // Don't append unit if the name already contains "DPMO" and the unit is "DPMO"
  // or if this is BOC which doesn't have a unit
  const showUnit = !(kpi.name.includes("DPMO") && kpi.unit === "DPMO") && !isBOC;

  return (
    <TableRow className="border-b border-gray-100 hover:bg-gray-50">
      <TableCell className="py-2 px-3 text-sm truncate" title={kpi.name}>{kpi.name}</TableCell>
      <TableCell className="py-2 px-3 text-center">
        <div className="flex items-center justify-center">
          <span className="font-medium whitespace-nowrap">{displayValue}{showUnit ? kpi.unit : ""}</span>
          {!isBOC && change && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={`text-xs ml-2 flex items-center ${change.isPositive ? "text-green-500" : "text-red-500"}`}>
                  {change.isPositive ? (
                    <ArrowUp className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-0.5" />
                  )}
                  {change.display}{showUnit ? kpi.unit : ""}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Vorwoche: {previousKPI?.value}{showUnit ? kpi.unit : ""}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TableCell>
      <TableCell className="py-2 px-3 text-center whitespace-nowrap">
        {isBOC ? "" : `${formatKPIValue(kpi.target, kpi.unit)}${showUnit ? kpi.unit : ""}`}
      </TableCell>
      <TableCell className="py-2 px-3 text-center">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getStatusClass(displayStatus)}`}>
          {displayStatus || "N/A"}
        </span>
      </TableCell>
    </TableRow>
  );
};

export default KPITableRow;
