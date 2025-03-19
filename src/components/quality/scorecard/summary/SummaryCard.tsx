
import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SummaryCardProps } from "./types";

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  icon, 
  value, 
  status, 
  statusColorClass = "", 
  change, 
  previousValue,
  rankChangeInfo,
  rankNote
}) => {
  return (
    <div className="bg-white rounded-lg border p-3 flex items-center justify-between relative">
      <div className="flex items-center">
        {icon}
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <div className="flex items-baseline">
        <span className={`text-xl font-bold ${statusColorClass}`}>
          {value}
        </span>
        {status && (
          <span className={`ml-2 text-sm ${statusColorClass}`}>
            {status}
          </span>
        )}
        
        {change && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center ml-2 text-xs">
                  {change.isPositive ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-0.5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-0.5" />
                  )}
                  <span className={change.isPositive ? "text-green-500" : "text-red-500"}>
                    {change.difference > 0 ? "+" : ""}
                    {Math.round(change.difference)}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Vorwoche: {previousValue}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {rankNote && rankChangeInfo && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className={`ml-2 text-xs flex items-center ${rankChangeInfo.color || 'text-gray-500'}`}>
                  {rankChangeInfo.icon}
                  <span className="ml-0.5">({rankNote})</span>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Vorwoche: {previousValue}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {previousValue !== undefined && (
        <div className="absolute -top-2 -right-2">
          <Badge variant="outline" className="text-[9px] bg-gray-50 font-normal">
            Vorwoche: {previousValue}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
