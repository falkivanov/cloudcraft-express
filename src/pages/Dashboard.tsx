
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileUpIcon, TrendingUp, TrendingDown, Truck, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateDriverScore } from "@/components/quality/scorecard/driver/utils";
import { ScoreCardData } from "@/components/quality/scorecard/types";
import { getScorecardData, getPreviousWeekData } from "@/components/quality/scorecard/data";

const Dashboard = () => {
  const [currentWeekData, setCurrentWeekData] = useState<ScoreCardData | null>(null);
  const [previousWeekData, setPreviousWeekData] = useState<ScoreCardData | null>(null);
  
  useEffect(() => {
    // Get the current week data (KW9)
    const data = getScorecardData(null, "week-9-2025");
    setCurrentWeekData(data);
    
    // Get the previous week data (KW8)
    const prevData = getPreviousWeekData("week-9-2025");
    setPreviousWeekData(prevData);
  }, []);
  
  const { improved, worsened, highPerformers } = React.useMemo(() => {
    if (!currentWeekData || !previousWeekData) {
      return { improved: [], worsened: [], highPerformers: [] };
    }

    const driverChanges = [];
    const topPerformers = [];

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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Most Improved Drivers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span>Am meisten verbesserte Fahrer</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {improved.length > 0 ? (
              <div className="space-y-4">
                {improved.map((item) => (
                  <div key={item.driver.name} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <p className="font-medium">{item.driver.name}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span>Vorwoche: {item.previousScore}</span>
                        <span>→</span>
                        <span>Aktuell: {item.currentScore}</span>
                      </div>
                    </div>
                    <div className="bg-green-100 text-green-700 font-medium px-3 py-1 rounded-full">
                      +{item.change}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Keine Daten verfügbar
              </p>
            )}
          </CardContent>
        </Card>

        {/* Most Worsened Drivers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <span>Am meisten verschlechterte Fahrer</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {worsened.length > 0 ? (
              <div className="space-y-4">
                {worsened.map((item) => (
                  <div key={item.driver.name} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <p className="font-medium">{item.driver.name}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span>Vorwoche: {item.previousScore}</span>
                        <span>→</span>
                        <span>Aktuell: {item.currentScore}</span>
                      </div>
                    </div>
                    <div className="bg-red-100 text-red-700 font-medium px-3 py-1 rounded-full">
                      {item.change}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Keine Daten verfügbar
              </p>
            )}
          </CardContent>
        </Card>

        {/* High Performers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>100% Score Performers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {highPerformers.length > 0 ? (
              <div className="space-y-4">
                {highPerformers.map((driver) => (
                  <div key={driver.name} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <p className="font-medium">{driver.name}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span>Perfekter Score in beiden Wochen</span>
                      </div>
                    </div>
                    <div className="bg-yellow-100 text-yellow-700 font-medium px-3 py-1 rounded-full">
                      100
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Keine perfekten Performer in beiden Wochen
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/file-upload" className="block">
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FileUpIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold">Dateien hochladen</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Laden Sie PDF, Excel, CSV und HTML-Dateien zur Verarbeitung hoch.
            </p>
            <Button>
              <FileUpIcon className="mr-2 h-4 w-4" />
              Zu Datei-Upload
            </Button>
          </div>
        </Link>
        
        <Link to="/quality/scorecard" className="block">
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold">KPI Scorecard</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Analysen und Übersichten der Fahrer und Unternehmensleistung.
            </p>
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Zu Scorecard
            </Button>
          </div>
        </Link>
        
        <Link to="/fleet" className="block">
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">Flottenverwaltung</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Flottenverwaltung und Fahrzeugübersicht mit Statistiken.
            </p>
            <Button variant="outline">
              <Truck className="mr-2 h-4 w-4" />
              Zur Flotte
            </Button>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
