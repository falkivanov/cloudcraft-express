
import React, { useState, useEffect } from "react";
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
import { parseWeekIdentifier, isDataAvailableForWeek, getScorecardData } from "./data";

interface ScorecardContentProps {
  scorecardData: ScoreCardData | null;
  prevWeekData: ScoreCardData | null;
}

const ScorecardContent: React.FC<ScorecardContentProps> = ({ scorecardData, prevWeekData }) => {
  const [activeTab, setActiveTab] = useState<string>("company");
  const { selectedWeek, setSelectedWeek, loadScorecardDataForWeek } = useScorecardWeek(scorecardData);
  const [currentWeekData, setCurrentWeekData] = useState<ScoreCardData | null>(scorecardData);
  const [currentPrevWeekData, setCurrentPrevWeekData] = useState<ScoreCardData | null>(prevWeekData);
  
  // Update data when selected week changes
  useEffect(() => {
    if (selectedWeek) {
      const weekData = loadScorecardDataForWeek(selectedWeek);
      setCurrentWeekData(weekData);
      
      // Get previous week data for comparison
      const parsedWeek = parseWeekIdentifier(selectedWeek);
      if (parsedWeek) {
        const { weekNum, year } = parsedWeek;
        
        // Calculate previous week
        let prevWeekNum = weekNum - 1;
        let prevYear = year;
        
        // Handle year boundary (week 1)
        if (prevWeekNum < 1) {
          prevWeekNum = 52; // Assuming 52 weeks in a year
          prevYear = year - 1;
        }
        
        // Construct the previous week identifier and get the data
        const prevWeekId = `week-${prevWeekNum}-${prevYear}`;
        const prevData = loadScorecardDataForWeek(prevWeekId);
        setCurrentPrevWeekData(prevData);
      }
    }
  }, [selectedWeek, loadScorecardDataForWeek]);
  
  if (!currentWeekData && !scorecardData) {
    return <NoDataMessage category="scorecard" />;
  }
  
  // Use current week data or fall back to props
  const displayData = currentWeekData || scorecardData || null;
  const displayPrevData = currentPrevWeekData || prevWeekData || null;
  
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
          <UnavailableWeekMessage weekIdentifier={selectedWeek} />
        ) : (
          <ScorecardTabsContent
            data={displayData}
            previousWeekData={displayPrevData}
            scorecardTab={activeTab}
            setScorecardTab={setActiveTab}
          />
        )}
      </Card>
    </div>
  );
};

export default ScorecardContent;
