
import React from "react";
import { LineChart, Award, ArrowUp, ArrowDown } from "lucide-react";
import { ScoreCardData } from "./types";
import SummaryCard from "./summary/SummaryCard";
import FocusAreasCard from "./summary/FocusAreasCard";
import { 
  getStatusColorClass, 
  getRankColorClass, 
  getRankChangeInfo, 
  getMetricChange 
} from "./summary/utils";

interface ScorecardSummaryProps {
  data: ScoreCardData;
  previousWeekData: ScoreCardData | null;
}

const ScorecardSummary: React.FC<ScorecardSummaryProps> = ({ data, previousWeekData }) => {
  // Calculate changes for KPIs
  const scoreChange = previousWeekData ? getMetricChange(data.overallScore, previousWeekData.overallScore) : null;

  // Get rank change info
  const baseRankChangeInfo = getRankChangeInfo(data.rankNote);
  const rankChangeInfo = baseRankChangeInfo ? {
    ...baseRankChangeInfo,
    icon: baseRankChangeInfo.color === "text-red-500" 
      ? <ArrowDown className="h-3 w-3 text-red-500" /> 
      : <ArrowUp className="h-3 w-3 text-green-500" />
  } : null;

  return (
    <div className="mt-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Overall Score */}
        <SummaryCard
          title="Overall Score"
          icon={<LineChart className="h-4 w-4 mr-2 text-primary" />}
          value={data.overallScore}
          status={data.overallStatus}
          statusColorClass={getStatusColorClass(data.overallStatus)}
          change={scoreChange}
          previousValue={previousWeekData?.overallScore}
        />

        {/* Rank */}
        <SummaryCard
          title="Rank at DSU1"
          icon={<Award className="h-4 w-4 mr-2 text-primary" />}
          value={data.rank}
          statusColorClass={getRankColorClass(data.rank)}
          rankChangeInfo={rankChangeInfo}
          rankNote={data.rankNote}
          previousValue={previousWeekData?.rank}
        />

        {/* Focus Areas */}
        <FocusAreasCard 
          focusAreas={data.recommendedFocusAreas}
          previousFocusAreas={previousWeekData?.recommendedFocusAreas}
        />
      </div>
    </div>
  );
};

export default ScorecardSummary;
