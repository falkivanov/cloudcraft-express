
import React from "react";
import { ScorecardKPI } from "./types";
import { TableCell, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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
  
  // Treat "none" status as "fantastic" for BOC
  const displayStatus = kpi.name === "Breach of Contract (BOC)" && kpi.status === "none" 
    ? "fantastic" 
    : kpi.status;

  // Don't append unit if the name already contains "DPMO" and the unit is "DPMO"
  const showUnit = !(kpi.name.includes("DPMO") && kpi.unit === "DPMO");

  return (
    <TableRow className="border-b border-gray-100 hover:bg-gray-50">
      <TableCell className="py-2 px-3 text-sm">{kpi.name}</TableCell>
      <TableCell className="py-2 px-3 text-center">
        <div className="flex items-center justify-center">
          <span className="font-medium">{formatKPIValue(kpi.value, kpi.unit)}{showUnit ? kpi.unit : ""}</span>
          {change && (
            <TooltipProvider>
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
            </TooltipProvider>
          )}
        </div>
      </TableCell>
      <TableCell className="py-2 px-3 text-center">{formatKPIValue(kpi.target, kpi.unit)}{showUnit ? kpi.unit : ""}</TableCell>
      <TableCell className="py-2 px-3 text-center">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getStatusClass(displayStatus)}`}>
          {displayStatus || "N/A"}
        </span>
      </TableCell>
    </TableRow>
  );
};

export default KPITableRow;
