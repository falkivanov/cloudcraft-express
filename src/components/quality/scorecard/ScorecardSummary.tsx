
import React from "react";
import { AlertTriangle, Award, LineChart } from "lucide-react";
import { ScoreCardData } from "./types";

interface ScorecardSummaryProps {
  data: ScoreCardData;
}

const ScorecardSummary: React.FC<ScorecardSummaryProps> = ({ data }) => {
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

  return (
    <div className="mt-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Overall Score */}
        <div className="bg-white rounded-lg border p-3 flex items-center justify-between">
          <div className="flex items-center">
            <LineChart className="h-4 w-4 mr-2 text-primary" />
            <h3 className="text-sm font-medium">Overall Score</h3>
          </div>
          <div className="flex items-baseline">
            <span className="text-xl font-bold">{data.overallScore.toFixed(2)}</span>
            <span className={`ml-2 text-sm ${getStatusColorClass(data.overallStatus)}`}>
              {data.overallStatus}
            </span>
          </div>
        </div>

        {/* Rank */}
        <div className="bg-white rounded-lg border p-3 flex items-center justify-between">
          <div className="flex items-center">
            <Award className="h-4 w-4 mr-2 text-primary" />
            <h3 className="text-sm font-medium">Rank at DSU1</h3>
          </div>
          <div className="flex items-baseline">
            <span className="text-xl font-bold">{data.rank}</span>
            {data.rankNote && (
              <span className="ml-2 text-xs text-gray-500">({data.rankNote})</span>
            )}
          </div>
        </div>

        {/* Focus Areas */}
        <div className="bg-white rounded-lg border p-3">
          <div className="flex items-center mb-1">
            <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
            <h3 className="text-sm font-medium">Focus Areas</h3>
          </div>
          <ul className="text-xs space-y-0.5 list-inside list-disc">
            {data.recommendedFocusAreas.map((area, index) => (
              <li key={index} className="text-gray-700 truncate">{area}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScorecardSummary;
