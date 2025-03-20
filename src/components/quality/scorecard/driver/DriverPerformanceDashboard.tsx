
import React from "react";
import { ScoreCardData } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Trophy, AlertTriangle } from "lucide-react";
import { useDriverPerformanceData } from "../hooks/useDriverPerformanceData";
import DriverPerformanceCard from "./DriverPerformanceCard";

interface DriverPerformanceDashboardProps {
  currentWeekData: ScoreCardData;
  previousWeekData: ScoreCardData | null;
}

const DriverPerformanceDashboard: React.FC<DriverPerformanceDashboardProps> = ({
  currentWeekData,
  previousWeekData
}) => {
  const { improved, worsened, highPerformers } = useDriverPerformanceData(currentWeekData, previousWeekData);

  if (!previousWeekData) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm">Keine Vergleichsdaten aus der Vorwoche verfügbar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Most Improved Drivers */}
      <DriverPerformanceCard
        title="Top 3 Meistverbesserte Fahrer"
        icon={<TrendingUp className="h-4 w-4 text-green-500" />}
        driverData={improved}
        type="improved"
      />

      {/* Most Worsened Drivers */}
      <DriverPerformanceCard
        title="Top 3 Meistverslechterte Fahrer"
        icon={<TrendingDown className="h-4 w-4 text-red-500" />}
        driverData={worsened}
        type="worsened"
      />

      {/* High Performers */}
      <DriverPerformanceCard
        title="100% Score Performers"
        icon={<Trophy className="h-4 w-4 text-yellow-500" />}
        driverData={highPerformers}
        type="highPerformers"
      />
    </div>
  );
};

export default DriverPerformanceDashboard;
