
import React, { useState, useEffect } from "react";
import { BarChart, UsersRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  
  // Initialize with week 10 as default since our test data is from KW10
  const [selectedWeek, setSelectedWeek] = useState<string>("week-10-2025");
  
  // Get data (either actual or dummy)
  const data = getScorecardData(scorecardData, selectedWeek);

  // Try to extract week number from data if it exists
  useEffect(() => {
    if (scorecardData) {
      // Set the week from our data
      const weekId = `week-${scorecardData.week}-${scorecardData.year}`;
      setSelectedWeek(weekId);
      console.log(`Using week ${scorecardData.week} from scorecard data`);
    }
  }, [scorecardData]);

  // Check if selected week is below KW6 (where we don't have data)
  const isUnavailableWeek = () => {
    const weekMatch = selectedWeek.match(/week-(\d+)-(\d+)/);
    if (weekMatch) {
      const weekNum = parseInt(weekMatch[1], 10);
      const year = parseInt(weekMatch[2], 10);
      
      // We only have data for week 6 and above in 2025
      return (year === 2025 && weekNum < 6);
    }
    return false;
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
              Zu dieser Woche wurden keine Daten hochgeladen. Bitte wählen Sie KW6 oder höher.
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
          <ScorecardSummary data={data} />
          
          {/* Content sections */}
          <TabsContent value="company" className="w-full">
            <div className="max-w-4xl mx-auto">
              <CompanyKPIs companyKPIs={data.companyKPIs} />
            </div>
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
    </div>
  );
};

export default ScorecardContent;
