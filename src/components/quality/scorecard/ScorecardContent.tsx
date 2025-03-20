
import React, { useState } from "react";
import { ScoreCardData } from "./types";
import NoDataMessage from "../NoDataMessage";
import ScorecardWeekSelector from "./ScorecardWeekSelector";
import { getScorecardData, getPreviousWeekData } from "./data";
import UnavailableWeekMessage from "./components/UnavailableWeekMessage";
import ScorecardTabsContent from "./components/ScorecardTabsContent";
import { useScorecardWeek } from "./hooks/useScorecardWeek";

interface ScorecardContentProps {
  scorecardData: ScoreCardData | null;
}

const ScorecardContent: React.FC<ScorecardContentProps> = ({ scorecardData }) => {
  // Scorecard specific states
  const [scorecardTab, setScorecardTab] = useState<string>("company");
  const [driverStatusTab, setDriverStatusTab] = useState<string>("active");
  
  // Handle week selection with custom hook
  const { selectedWeek, setSelectedWeek, isUnavailableWeek } = useScorecardWeek(scorecardData);
  
  // Get data (either actual or dummy)
  const data = getScorecardData(scorecardData, selectedWeek);
  
  // Get previous week's data for comparison
  const previousWeekData = getPreviousWeekData(selectedWeek);

  if (!data) {
    return <NoDataMessage category="Scorecard" />;
  }

  if (isUnavailableWeek()) {
    return (
      <UnavailableWeekMessage 
        selectedWeek={selectedWeek}
        setSelectedWeek={setSelectedWeek}
      />
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
        <ScorecardTabsContent
          data={data}
          previousWeekData={previousWeekData}
          scorecardTab={scorecardTab}
          setScorecardTab={setScorecardTab}
          driverStatusTab={driverStatusTab}
          setDriverStatusTab={setDriverStatusTab}
        />
      </div>
    </div>
  );
};

export default ScorecardContent;
