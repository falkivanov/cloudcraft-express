
import React, { useState } from "react";
import { ScoreCardData } from "./types";
import { Card } from "@/components/ui/card";
import NoDataMessage from "../NoDataMessage";
import CompanyKPIs from "./CompanyKPIs";
import DriverKPIs from "./DriverKPIs";
import ScorecardSummary from "./ScorecardSummary";
import ScorecardTabsContent from "./components/ScorecardTabsContent";
import UnavailableWeekMessage from "./components/UnavailableWeekMessage";
import { useScorecardWeek } from "./hooks/useScorecardWeek";
import ScorecardWeekSelector from "./ScorecardWeekSelector";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UploadIcon } from "lucide-react";
import { parseWeekIdentifier, isDataAvailableForWeek } from "./data";

interface ScorecardContentProps {
  scorecardData: ScoreCardData | null;
  prevWeekData: ScoreCardData | null;
}

const ScorecardContent: React.FC<ScorecardContentProps> = ({ scorecardData, prevWeekData }) => {
  const [activeTab, setActiveTab] = useState<string>("summary");
  const { selectedWeek, setSelectedWeek } = useScorecardWeek();
  
  if (!scorecardData) {
    return <NoDataMessage category="scorecard" />;
  }
  
  // Check if data available for selected week
  const parsedWeek = parseWeekIdentifier(selectedWeek);
  const isDataAvailable = parsedWeek ? 
    isDataAvailableForWeek(parsedWeek.weekNum, parsedWeek.year) : 
    false;
  
  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Scorecard</h2>
      </div>

      <div className="flex items-center justify-between">
        <ScorecardWeekSelector
          selectedWeek={selectedWeek}
          setSelectedWeek={setSelectedWeek}
        />
        
        <Button asChild variant="outline" size="sm">
          <Link to="/file-upload" className="flex items-center gap-2">
            <UploadIcon className="h-4 w-4" />
            <span>Neue Datei hochladen</span>
          </Link>
        </Button>
      </div>

      <Card className="w-full p-0">
        {!isDataAvailable ? (
          <UnavailableWeekMessage weekId={selectedWeek} />
        ) : (
          <ScorecardTabsContent 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            scorecardData={scorecardData}
            prevWeekData={prevWeekData}
          >
            {activeTab === "summary" && (
              <ScorecardSummary 
                scorecardData={scorecardData} 
                prevWeekData={prevWeekData}
              />
            )}
            {activeTab === "company" && (
              <CompanyKPIs 
                kpis={scorecardData.companyKPIs} 
                prevWeekKpis={prevWeekData?.companyKPIs} 
              />
            )}
            {activeTab === "drivers" && (
              <DriverKPIs 
                weekNo={scorecardData.week} 
                year={scorecardData.year}
                scoreCardData={scorecardData} 
              />
            )}
          </ScorecardTabsContent>
        )}
      </Card>
    </div>
  );
};

export default ScorecardContent;
