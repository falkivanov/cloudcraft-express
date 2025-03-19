
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
        return "text-green-600";
      case "great":
        return "text-blue-600";
      case "fair":
        return "text-yellow-600";
      case "poor":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="mt-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Score */}
        <div className="bg-white rounded-lg border p-4 flex flex-col items-center">
          <div className="flex items-center mb-2">
            <LineChart className="h-5 w-5 mr-2 text-primary" />
            <h3 className="text-md font-medium">Overall Score</h3>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{data.overallScore.toFixed(2)}</span>
            <span className={`ml-2 text-lg ${getStatusColorClass(data.overallStatus)}`}>
              {data.overallStatus}
            </span>
          </div>
        </div>

        {/* Rank */}
        <div className="bg-white rounded-lg border p-4 flex flex-col items-center">
          <div className="flex items-center mb-2">
            <Award className="h-5 w-5 mr-2 text-primary" />
            <h3 className="text-md font-medium">Rank at DSU1</h3>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{data.rank}</span>
            {data.rankNote && (
              <span className="ml-2 text-sm text-gray-500">({data.rankNote})</span>
            )}
          </div>
        </div>

        {/* Focus Areas */}
        <div className="bg-white rounded-lg border p-4 flex flex-col">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            <h3 className="text-md font-medium">Focus Areas</h3>
          </div>
          <ul className="text-sm space-y-1 list-inside list-decimal">
            {data.recommendedFocusAreas.map((area, index) => (
              <li key={index} className="text-gray-700">{area}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScorecardSummary;
