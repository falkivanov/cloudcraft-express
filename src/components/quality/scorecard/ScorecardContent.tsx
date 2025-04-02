
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
import { getDefaultTargetForKPI } from './utils/helpers/statusHelper';

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
  
  // Apply custom targets to data if available
  const applyCustomTargets = () => {
    if (!currentWeekData) return;
    
    try {
      // Apply only to company KPIs
      const updatedCompanyKPIs = currentWeekData.companyKPIs.map(kpi => {
        // Get the target value for this KPI for the current week/year
        const customTarget = getDefaultTargetForKPI(
          kpi.name, 
          currentWeekData.week, 
          currentWeekData.year
        );
        
        return { ...kpi, target: customTarget };
      });
      
      setCurrentWeekData({
        ...currentWeekData,
        companyKPIs: updatedCompanyKPIs
      });
    } catch (error) {
      console.error("Error applying custom targets:", error);
    }
  };
  
  // Apply custom targets when data changes
  useEffect(() => {
    applyCustomTargets();
  }, [currentWeekData?.week]); // Only re-run when the week changes
  
  // Listen for target updates
  useEffect(() => {
    const handleTargetsUpdated = () => {
      console.log("Targets updated, reapplying...");
      applyCustomTargets();
    };
    
    window.addEventListener('scorecard_targets_updated', handleTargetsUpdated);
    return () => {
      window.removeEventListener('scorecard_targets_updated', handleTargetsUpdated);
    };
  }, [currentWeekData]); // Dependency on currentWeekData to ensure we have the latest data
  
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
