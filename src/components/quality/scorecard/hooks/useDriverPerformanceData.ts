
import { useMemo } from "react";
import { DriverKPI, ScoreCardData } from "../types";
import { calculateDriverScore } from "../driver/utils";

export interface DriverChange {
  driver: DriverKPI;
  previousScore: number;
  currentScore: number;
  change: number;
}

export function useDriverPerformanceData(
  currentWeekData: ScoreCardData | null,
  previousWeekData: ScoreCardData | null
) {
  return useMemo(() => {
    if (!currentWeekData || !previousWeekData) {
      return { improved: [], worsened: [], highPerformers: [] };
    }

    const driverChanges: DriverChange[] = [];
    const topPerformers: DriverKPI[] = [];

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

          // Check for high performers (score 100 in both weeks)
          if (currentScore === 100 && previousScore === 100) {
            topPerformers.push(currentDriver);
          }

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

    return { improved, worsened, highPerformers: topPerformers };
  }, [currentWeekData, previousWeekData]);
}
