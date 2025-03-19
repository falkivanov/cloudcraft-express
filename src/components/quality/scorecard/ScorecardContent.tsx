
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
  const [selectedWeek, setSelectedWeek] = useState<string>("current");
  
  // Get data (either actual or dummy)
  const data = getScorecardData(scorecardData);

  // Try to extract week number from PDF data if it exists
  useEffect(() => {
    if (scorecardData) {
      const storedData = localStorage.getItem("scorecardData");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          if (parsedData.fileName) {
            // Try to extract from filename first (e.g., "Scorecard_KW_23_2023.pdf")
            const weekMatch = parsedData.fileName.match(/KW[_\s]*(\d+)/i);
            if (weekMatch && weekMatch[1]) {
              const extractedWeek = parseInt(weekMatch[1], 10);
              const currentYear = new Date().getFullYear();
              const weekId = `week-${extractedWeek}-${currentYear}`;
              setSelectedWeek(weekId);
              console.log(`Extracted week ${extractedWeek} from filename`);
            }
          }
        } catch (error) {
          console.error("Error parsing scorecard data for week extraction:", error);
        }
      }
    }
  }, [scorecardData]);

  if (!data) {
    return <NoDataMessage category="Scorecard" />;
  }

  return (
    <div className="p-4 border rounded-lg bg-background">
      <div className="flex flex-col space-y-6">
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
