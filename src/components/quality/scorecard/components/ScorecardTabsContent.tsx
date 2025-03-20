
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, UsersRound } from "lucide-react";
import CompanyKPIs from "../CompanyKPIs";
import DriverKPIs from "../DriverKPIs";
import ScorecardSummary from "../ScorecardSummary";
import { ScoreCardData } from "../types";

interface ScorecardTabsContentProps {
  data: ScoreCardData;
  previousWeekData: ScoreCardData | null;
  scorecardTab: string;
  setScorecardTab: (value: string) => void;
  driverStatusTab: string;
  setDriverStatusTab: (value: string) => void;
}

const ScorecardTabsContent: React.FC<ScorecardTabsContentProps> = ({
  data,
  previousWeekData,
  scorecardTab,
  setScorecardTab,
  driverStatusTab,
  setDriverStatusTab,
}) => {
  return (
    <Tabs value={scorecardTab} onValueChange={setScorecardTab}>
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
      
      {/* Header with summary information */}
      <ScorecardSummary data={data} previousWeekData={previousWeekData} />
      
      {/* Content sections */}
      <TabsContent value="company" className="w-full">
        <div className="max-w-4xl mx-auto">
          <CompanyKPIs companyKPIs={data.companyKPIs} previousWeekData={previousWeekData} />
        </div>
      </TabsContent>
      
      <TabsContent value="driver" className="w-full">
        <DriverKPIs 
          driverKPIs={data.driverKPIs}
          driverStatusTab={driverStatusTab}
          setDriverStatusTab={setDriverStatusTab}
          previousWeekData={previousWeekData}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ScorecardTabsContent;
