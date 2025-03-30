
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import ScorecardSummary from "./ScorecardSummary";
import CompanyKPIs from "./CompanyKPIs";
import DriverKPIs from "./DriverKPIs";
import ScorecardTabsContent from './components/ScorecardTabsContent';
import { ScoreCardData } from './types';
import UnavailableWeekMessage from './components/UnavailableWeekMessage';
import { useScorecardWeek } from './hooks/useScorecardWeek';
import ScorecardWeekSelector from './ScorecardWeekSelector';
import { getPreviousWeekData } from './data/dataProvider';

interface ScorecardContentProps {
  scorecardData: ScoreCardData | null;
  prevWeekData: ScoreCardData | null;
}

const ScorecardContent: React.FC<ScorecardContentProps> = ({ 
  scorecardData: initialScorecardData, 
  prevWeekData: initialPrevWeekData 
}) => {
  const [scorecardTab, setScorecardTab] = useState<string>("company");
  const { selectedWeek, setSelectedWeek, isUnavailableWeek, loadScorecardDataForWeek } = useScorecardWeek(initialScorecardData);
  const [currentWeekData, setCurrentWeekData] = useState<ScoreCardData | null>(initialScorecardData);
  const [prevWeekData, setPrevWeekData] = useState<ScoreCardData | null>(initialPrevWeekData);
  
  // Load scorecard data when selected week changes
  useEffect(() => {
    if (selectedWeek && selectedWeek !== "week-0-0") {
      const weekData = loadScorecardDataForWeek(selectedWeek);
      setCurrentWeekData(weekData);
      
      // Also get previous week data
      const previousData = getPreviousWeekData(selectedWeek);
      setPrevWeekData(previousData);
    } else {
      setCurrentWeekData(null);
      setPrevWeekData(null);
    }
  }, [selectedWeek]);
  
  if (isUnavailableWeek() || !currentWeekData) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Scorecard</h2>
          <ScorecardWeekSelector 
            selectedWeek={selectedWeek}
            setSelectedWeek={setSelectedWeek}
          />
        </div>
        <UnavailableWeekMessage />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Scorecard</h2>
        <ScorecardWeekSelector 
          selectedWeek={selectedWeek}
          setSelectedWeek={setSelectedWeek}
        />
      </div>
      
      {currentWeekData.isSampleData && (
        <Alert variant="warning" className="mb-4 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Achtung: Beispieldaten</AlertTitle>
          <AlertDescription>
            Die angezeigten Daten konnten nicht vollständig aus der PDF extrahiert werden und wurden teilweise 
            mit Beispieldaten ergänzt. Die Daten entsprechen möglicherweise nicht der tatsächlichen Scorecard.
          </AlertDescription>
        </Alert>
      )}
      
      <ScorecardTabsContent 
        data={currentWeekData}
        previousWeekData={prevWeekData}
        scorecardTab={scorecardTab}
        setScorecardTab={setScorecardTab}
      />
    </div>
  );
};

export default ScorecardContent;
