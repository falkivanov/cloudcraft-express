
import React, { useState, useEffect } from "react";
import { FileUpIcon, TrendingUp, TrendingDown, Truck, Trophy } from "lucide-react";
import { ScoreCardData } from "@/components/quality/scorecard/types";
import { getScorecardData, getPreviousWeekData } from "@/components/quality/scorecard/data";
import DriverPerformanceCard from "@/components/quality/scorecard/driver/DriverPerformanceCard";
import DashboardNavigationCard from "@/components/dashboard/DashboardNavigationCard";
import { useDriverPerformanceData } from "@/components/quality/scorecard/hooks/useDriverPerformanceData";

const Dashboard = () => {
  const [currentWeekData, setCurrentWeekData] = useState<ScoreCardData | null>(null);
  const [previousWeekData, setPreviousWeekData] = useState<ScoreCardData | null>(null);
  
  useEffect(() => {
    // Get the current week data (KW11)
    const data = getScorecardData(null, "week-11-2025");
    setCurrentWeekData(data);
    
    // Get the previous week data (KW10)
    const prevData = getPreviousWeekData("week-11-2025");
    setPreviousWeekData(prevData);
  }, []);
  
  const { improved, worsened, highPerformers } = useDriverPerformanceData(currentWeekData, previousWeekData);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Most Improved Drivers */}
        <DriverPerformanceCard
          title="Am meisten verbesserte Fahrer"
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          driverData={improved}
          type="improved"
          fullWidth={true}
        />

        {/* Most Worsened Drivers */}
        <DriverPerformanceCard
          title="Am meisten verschlechterte Fahrer"
          icon={<TrendingDown className="h-5 w-5 text-red-500" />}
          driverData={worsened}
          type="worsened"
          fullWidth={true}
        />

        {/* High Performers */}
        <DriverPerformanceCard
          title="100% Score Performers"
          icon={<Trophy className="h-5 w-5 text-yellow-500" />}
          driverData={highPerformers}
          type="highPerformers"
          fullWidth={true}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardNavigationCard
          icon={<FileUpIcon />}
          iconBgClass="bg-blue-100"
          iconTextClass="text-blue-600"
          title="Dateien hochladen"
          description="Laden Sie PDF, Excel, CSV und HTML-Dateien zur Verarbeitung hoch."
          buttonIcon={<FileUpIcon className="mr-2 h-4 w-4" />}
          buttonText="Zu Datei-Upload"
          linkTo="/file-upload"
          buttonVariant="default"
        />
        
        <DashboardNavigationCard
          icon={<TrendingUp />}
          iconBgClass="bg-purple-100"
          iconTextClass="text-purple-600"
          title="KPI Scorecard"
          description="Analysen und Übersichten der Fahrer und Unternehmensleistung."
          buttonIcon={<TrendingUp className="mr-2 h-4 w-4" />}
          buttonText="Zu Scorecard"
          linkTo="/quality/scorecard"
          buttonVariant="outline"
        />
        
        <DashboardNavigationCard
          icon={<Truck />}
          iconBgClass="bg-green-100"
          iconTextClass="text-green-600"
          title="Flottenverwaltung"
          description="Flottenverwaltung und Fahrzeugübersicht mit Statistiken."
          buttonIcon={<Truck className="mr-2 h-4 w-4" />}
          buttonText="Zur Flotte"
          linkTo="/fleet"
          buttonVariant="outline"
        />
      </div>
    </div>
  );
};

export default Dashboard;
