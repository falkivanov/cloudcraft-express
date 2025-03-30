
import React, { useState } from 'react';
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

interface ScorecardContentProps {
  scorecardData: ScoreCardData | null;
  prevWeekData: ScoreCardData | null;
}

const ScorecardContent: React.FC<ScorecardContentProps> = ({ 
  scorecardData, 
  prevWeekData 
}) => {
  const [scorecardTab, setScorecardTab] = useState<string>("company");
  
  if (!scorecardData) {
    return <UnavailableWeekMessage />;
  }
  
  return (
    <div>
      {scorecardData.isSampleData && (
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
        data={scorecardData}
        previousWeekData={prevWeekData}
        scorecardTab={scorecardTab}
        setScorecardTab={setScorecardTab}
      />
    </div>
  );
};

export default ScorecardContent;
