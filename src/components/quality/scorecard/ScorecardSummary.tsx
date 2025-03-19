
import React from "react";
import { BarChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import StatCard from "@/components/employees/dashboard/StatCard";
import { ScoreCardData } from "./types";

interface ScorecardSummaryProps {
  data: ScoreCardData;
}

const ScorecardSummary: React.FC<ScorecardSummaryProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
      <StatCard 
        title="Overall Score" 
        value={`${data.overallScore} | ${data.overallStatus}`} 
        icon={BarChart}
        description={`Woche ${data.week} - ${data.year}, ${data.location}`}
        colorClass="bg-green-100 text-green-800"
      />
      <StatCard 
        title="Rank at DSU1" 
        value={`${data.rank}`} 
        icon={BarChart}
        colorClass="bg-blue-100 text-blue-800"
      />
      <Card className="p-4">
        <h3 className="font-medium mb-2">Recommended Focus Areas</h3>
        <ul className="list-disc list-inside text-sm">
          {data.recommendedFocusAreas.map((area, index) => (
            <li key={index} className="text-muted-foreground">{area}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default ScorecardSummary;
