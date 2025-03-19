
import React, { useState } from "react";
import { BarChart, UsersRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScorecardTimeFrame from "./ScorecardTimeFrame";
import CompanyKPIs from "./CompanyKPIs";
import DriverKPIs from "./DriverKPIs";
import { ScoreCardData } from "./types";
import NoDataMessage from "../NoDataMessage";
import ScorecardWeekSelector from "./ScorecardWeekSelector";
import ScorecardSummary from "./ScorecardSummary";
import { getScorecardData } from "./ScorecardDataProvider";

interface ScorecardContentProps {
  scorecardData: ScoreCardData | null;
}

const ScorecardContent: React.FC<ScorecardContentProps> = ({ scorecardData }) => {
  // Scorecard specific states
  const [scorecardTab, setScorecardTab] = useState<string>("company");
  const [driverStatusTab, setDriverStatusTab] = useState<string>("active");
  const [timeframe, setTimeframe] = useState<string>("week");
  const [selectedWeek, setSelectedWeek] = useState<string>("current");
  
  // Get data (either actual or dummy)
  const data = getScorecardData(scorecardData);

  if (!data) {
    return <NoDataMessage category="Scorecard" />;
  }

  return (
    <div className="p-4 border rounded-lg bg-background">
      <div className="flex flex-col space-y-6">
        {/* Header with tabs and week selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Tabs for company/driver KPIs */}
          <div className="flex-1">
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
            
              {/* Time frame selector */}
              <ScorecardTimeFrame timeframe={timeframe} setTimeframe={setTimeframe} />
              
              {/* Header with summary information */}
              <ScorecardSummary data={data} />
              
              {/* Content sections */}
              <TabsContent value="company" className="w-full">
                <CompanyKPIs companyKPIs={data.companyKPIs} />
              </TabsContent>
              
              <TabsContent value="driver" className="w-full">
                <DriverKPIs 
                  driverKPIs={data.driverKPIs}
                  driverStatusTab={driverStatusTab}
                  setDriverStatusTab={setDriverStatusTab}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Week selector dropdown */}
          <ScorecardWeekSelector 
            selectedWeek={selectedWeek} 
            setSelectedWeek={setSelectedWeek} 
          />
        </div>
      </div>
    </div>
  );
};

export default ScorecardContent;
