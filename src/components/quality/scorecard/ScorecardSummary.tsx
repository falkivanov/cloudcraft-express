
import React from "react";
import { AlertTriangle, Award, LineChart, ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";
import { ScoreCardData } from "./types";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScorecardSummaryProps {
  data: ScoreCardData;
  previousWeekData: ScoreCardData | null;
}

const ScorecardSummary: React.FC<ScorecardSummaryProps> = ({ data, previousWeekData }) => {
  // Function to get the color class based on status
  const getStatusColorClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "fantastic":
        return "text-blue-600";
      case "great":
        return "text-yellow-600";
      case "fair":
        return "text-orange-600";
      case "poor":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Function to get rank color
  const getRankColorClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-amber-500"; // Gold
      case 2:
        return "text-gray-400"; // Silver
      case 3:
        return "text-amber-700"; // Bronze
      default:
        return "text-gray-900"; // Black for ranks > 3
    }
  };

  // Function to determine if rank changed from previous week
  const getRankChangeInfo = () => {
    if (!data.rankNote) return null;
    
    // Extract the numerical value from rankNote (e.g., "+2 WoW", "-1 WoW", "0 WoW")
    const match = data.rankNote.match(/([+-]?\d+)\s+WoW/);
    if (!match) return null;
    
    const change = parseInt(match[1], 10);
    
    if (change < 0) {
      // Negative change means rank worsened (e.g., -2 means went from rank 3 to rank 5)
      return { icon: <ArrowDown className="h-3 w-3 text-red-500" />, color: "text-red-500" };
    } else if (change > 0) {
      // Positive change means rank improved (e.g., +2 means went from rank 5 to rank 3)
      return { icon: <ArrowUp className="h-3 w-3 text-green-500" />, color: "text-green-500" };
    }
    
    // No change
    return null;
  };

  // Calculate changes from previous week
  const getMetricChange = (current: number, previous: number | undefined) => {
    if (previous === undefined) return null;
    
    const difference = current - previous;
    const percentChange = previous !== 0 ? (difference / previous) * 100 : 0;
    
    return {
      difference,
      percentChange,
      isPositive: difference > 0
    };
  };

  // Calculate changes for KPIs
  const scoreChange = previousWeekData ? getMetricChange(data.overallScore, previousWeekData.overallScore) : null;

  const rankChangeInfo = getRankChangeInfo();

  return (
    <div className="mt-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Overall Score */}
        <div className="bg-white rounded-lg border p-3 flex items-center justify-between relative">
          <div className="flex items-center">
            <LineChart className="h-4 w-4 mr-2 text-primary" />
            <h3 className="text-sm font-medium">Overall Score</h3>
          </div>
          <div className="flex items-baseline">
            <span className="text-xl font-bold">{data.overallScore}</span>
            <span className={`ml-2 text-sm ${getStatusColorClass(data.overallStatus)}`}>
              {data.overallStatus}
            </span>
            
            {scoreChange && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center ml-2 text-xs">
                      {scoreChange.isPositive ? (
                        <TrendingUp className="h-3 w-3 text-green-500 mr-0.5" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500 mr-0.5" />
                      )}
                      <span className={scoreChange.isPositive ? "text-green-500" : "text-red-500"}>
                        {scoreChange.difference > 0 ? "+" : ""}
                        {Math.round(scoreChange.difference)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Vorwoche: {previousWeekData?.overallScore}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          {previousWeekData && (
            <div className="absolute -top-2 -right-2">
              <Badge variant="outline" className="text-[9px] bg-gray-50 font-normal">
                Vorwoche: {previousWeekData.overallScore}
              </Badge>
            </div>
          )}
        </div>

        {/* Rank */}
        <div className="bg-white rounded-lg border p-3 flex items-center justify-between relative">
          <div className="flex items-center">
            <Award className="h-4 w-4 mr-2 text-primary" />
            <h3 className="text-sm font-medium">Rank at DSU1</h3>
          </div>
          <div className="flex items-baseline">
            <span className={`text-xl font-bold ${getRankColorClass(data.rank)}`}>
              {data.rank}
            </span>
            {data.rankNote && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className={`ml-2 text-xs flex items-center ${rankChangeInfo?.color || 'text-gray-500'}`}>
                      {rankChangeInfo?.icon}
                      <span className="ml-0.5">({data.rankNote})</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Vorwoche: Rank {previousWeekData?.rank}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          {previousWeekData && (
            <div className="absolute -top-2 -right-2">
              <Badge variant="outline" className="text-[9px] bg-gray-50 font-normal">
                Vorwoche: {previousWeekData.rank}
              </Badge>
            </div>
          )}
        </div>

        {/* Focus Areas */}
        <div className="bg-white rounded-lg border p-3">
          <div className="flex items-center mb-1">
            <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
            <h3 className="text-sm font-medium">Focus Areas</h3>
          </div>
          <ul className="text-xs space-y-0.5 list-inside list-disc">
            {data.recommendedFocusAreas.map((area, index) => (
              <li 
                key={index} 
                className={`text-gray-700 truncate ${
                  previousWeekData?.recommendedFocusAreas.includes(area) 
                    ? "font-medium text-amber-700" 
                    : ""
                }`}
              >
                {area}
                {previousWeekData?.recommendedFocusAreas.includes(area) && 
                  <span className="ml-1 text-[9px] text-gray-500">(wiederholt)</span>
                }
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScorecardSummary;
