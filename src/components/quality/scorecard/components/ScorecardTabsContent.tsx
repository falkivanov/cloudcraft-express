
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, UsersRound } from "lucide-react";
import CompanyKPIs from "../CompanyKPIs";
import DriverKPIs from "../DriverKPIs";
import ScorecardSummary from "../ScorecardSummary";
import { ScoreCardData } from "../types";
import DriverPerformanceDashboard from "../driver/DriverPerformanceDashboard";

export interface ScorecardTabsContentProps {
  data: ScoreCardData;
  previousWeekData: ScoreCardData | null;
  scorecardTab: string;
  setScorecardTab: (value: string) => void;
}

const ScorecardTabsContent: React.FC<ScorecardTabsContentProps> = ({
  data,
  previousWeekData,
  scorecardTab,
  setScorecardTab,
}) => {
  return (
    <Tabs value={scorecardTab} onValueChange={setScorecardTab} className="w-full">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="company" className="flex items-center gap-2">
          <BarChart className="h-4 w-4" />
          Firmen KPIs
        </TabsTrigger>
        <TabsTrigger value="driver" className="flex items-center gap-2">
          <UsersRound className="h-4 w-4" />
          Fahrer KPIs
        </TabsTrigger>
      </TabsList>
      
      {/* Content sections with consistent width */}
      <div className="w-full">
        <TabsContent value="company" className="w-full">
          {/* Header with summary information - only shown in Company tab */}
          <ScorecardSummary 
            data={data} 
            previousWeekData={previousWeekData} 
          />
          
          <div className="w-full mx-auto">
            <CompanyKPIs 
              data={data}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="driver" className="w-full">
          {/* Driver Performance Dashboard - Show when previous week data is available */}
          {previousWeekData && (
            <DriverPerformanceDashboard 
              currentWeekData={data} 
              previousWeekData={previousWeekData} 
            />
          )}
          
          {/* Driver KPIs table */}
          <DriverKPIs 
            driverKPIs={data.driverKPIs}
            previousWeekData={previousWeekData}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default ScorecardTabsContent;
