
import React, { useMemo } from "react";
import { DriverKPI, ScoreCardData } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { calculateDriverScore } from "./utils";

interface DriverPerformanceDashboardProps {
  currentWeekData: ScoreCardData;
  previousWeekData: ScoreCardData | null;
}

interface DriverChange {
  driver: DriverKPI;
  previousScore: number;
  currentScore: number;
  change: number;
}

const DriverPerformanceDashboard: React.FC<DriverPerformanceDashboardProps> = ({
  currentWeekData,
  previousWeekData
}) => {
  const { improved, worsened } = useMemo(() => {
    if (!previousWeekData) {
      return { improved: [], worsened: [] };
    }

    const driverChanges: DriverChange[] = [];

    // Process all active drivers from current week
    currentWeekData.driverKPIs
      .filter(driver => driver.status === "active")
      .forEach(currentDriver => {
        // Find the same driver in previous week
        const previousDriver = previousWeekData.driverKPIs.find(
          d => d.name === currentDriver.name && d.status === "active"
        );

        if (previousDriver) {
          // Calculate scores for both weeks
          const currentScore = calculateDriverScore(currentDriver).total;
          const previousScore = calculateDriverScore(previousDriver).total;
          const change = currentScore - previousScore;

          // Add to changes array if there's any change
          if (change !== 0) {
            driverChanges.push({
              driver: currentDriver,
              previousScore,
              currentScore,
              change
            });
          }
        }
      });

    // Sort by change amount (improved = highest positive change first)
    const improved = [...driverChanges]
      .filter(item => item.change > 0)
      .sort((a, b) => b.change - a.change)
      .slice(0, 3);

    // Sort by change amount (worsened = highest negative change first)
    const worsened = [...driverChanges]
      .filter(item => item.change < 0)
      .sort((a, b) => a.change - b.change)
      .slice(0, 3);

    return { improved, worsened };
  }, [currentWeekData, previousWeekData]);

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Most Improved Drivers */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span>Top 3 Meistverbesserte Fahrer</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {improved.length > 0 ? (
            <div className="space-y-4">
              {improved.map((item) => (
                <div key={item.driver.name} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.driver.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>Vorwoche: {item.previousScore}</span>
                      <span>→</span>
                      <span>Aktuell: {item.currentScore}</span>
                    </div>
                  </div>
                  <div className="bg-green-100 text-green-700 font-medium text-sm px-2 py-1 rounded">
                    +{item.change}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Keine Verbesserungen in dieser Woche
            </p>
          )}
        </CardContent>
      </Card>

      {/* Most Worsened Drivers */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span>Top 3 Meistverslechterte Fahrer</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {worsened.length > 0 ? (
            <div className="space-y-4">
              {worsened.map((item) => (
                <div key={item.driver.name} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.driver.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>Vorwoche: {item.previousScore}</span>
                      <span>→</span>
                      <span>Aktuell: {item.currentScore}</span>
                    </div>
                  </div>
                  <div className="bg-red-100 text-red-700 font-medium text-sm px-2 py-1 rounded">
                    {item.change}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Keine Verschlechterungen in dieser Woche
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverPerformanceDashboard;
