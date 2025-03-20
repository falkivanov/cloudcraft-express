
import React from "react";
import ScorecardWeekSelector from "../ScorecardWeekSelector";

interface UnavailableWeekMessageProps {
  selectedWeek: string;
  setSelectedWeek: (value: string) => void;
}

const UnavailableWeekMessage: React.FC<UnavailableWeekMessageProps> = ({
  selectedWeek,
  setSelectedWeek,
}) => {
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
};

export default UnavailableWeekMessage;
