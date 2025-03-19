import React, { useState, useEffect } from "react";
import { BarChart, UsersRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanyKPIs from "./CompanyKPIs";
import DriverKPIs from "./DriverKPIs";
import { ScoreCardData } from "./types";
import NoDataMessage from "../NoDataMessage";
import ScorecardWeekSelector from "./ScorecardWeekSelector";
import ScorecardSummary from "./ScorecardSummary";
import { 
  getScorecardData, 
  getPreviousWeekData, 
  isDataAvailableForWeek, 
  parseWeekIdentifier 
} from "./data";

interface ScorecardContentProps {
  scorecardData: ScoreCardData | null;
}

const ScorecardContent: React.FC<ScorecardContentProps> = ({ scorecardData }) => {
  // Scorecard specific states
  const [scorecardTab, setScorecardTab] = useState<string>("company");
  const [driverStatusTab, setDriverStatusTab] = useState<string>("active");
  
  // Initialize with week 10 as default since our test data is from KW10
  const [selectedWeek, setSelectedWeek] = useState<string>("week-10-2025");
  
  // Get data (either actual or dummy)
  const data = getScorecardData(scorecardData, selectedWeek);
  
  // Get previous week's data for comparison
  const previousWeekData = getPreviousWeekData(selectedWeek);

  // Try to extract week number from data if it exists
  useEffect(() => {
    if (scorecardData) {
      // Set the week from our data
      const weekId = `week-${scorecardData.week}-${scorecardData.year}`;
      setSelectedWeek(weekId);
      console.log(`Using week ${scorecardData.week} from scorecard data`);
    }
  }, [scorecardData]);

  // Check if selected week has available data
  const isUnavailableWeek = () => {
    const parsedWeek = parseWeekIdentifier(selectedWeek);
    if (!parsedWeek) return true;
    
    const { weekNum, year } = parsedWeek;
    return !isDataAvailableForWeek(weekNum, year);
  };

  if (!data) {
    return <NoDataMessage category="Scorecard" />;
  }

  if (isUnavailableWeek()) {
    return (
      <div className="p-4 border rounded-lg bg-background">
        <div className="flex flex-col space-y-6">
          {/* Week Selector */}
          <div className="flex justify-end">
            <ScorecardWeekSelector
              selectedWeek={selectedWeek}
              setSelectedWeek={setSelectedWeek}
            />
          </div>
          
          <div className="mt-6 p-6 border rounded-lg bg-gray-50 text-center">
            <p className="text-lg font-medium mb-3">Keine Daten verfügbar</p>
            <p className="text-muted-foreground">
              Bitte lade die Scorecard für diese Woche hoch oder wechsel die Woche.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-background">
      <div className="flex flex-col space-y-6">
        {/* Week Selector */}
        <div className="flex justify-end">
          <ScorecardWeekSelector
            selectedWeek={selectedWeek}
            setSelectedWeek={setSelectedWeek}
          />
        </div>

        {/* Tabs for company/driver KPIs */}
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
      </div>
    </div>
  );
};

export default ScorecardContent;
