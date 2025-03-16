
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ScorecardTimeFrameProps {
  timeframe: string;
  setTimeframe: (value: string) => void;
}

const ScorecardTimeFrame: React.FC<ScorecardTimeFrameProps> = ({
  timeframe,
  setTimeframe
}) => {
  return (
    <div className="mb-4">
      <RadioGroup 
        value={timeframe}
        onValueChange={setTimeframe}
        className="flex items-center space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="week" id="week" />
          <label htmlFor="week" className="text-sm">Woche</label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="month" id="month" />
          <label htmlFor="month" className="text-sm">Monat</label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="quarter" id="quarter" />
          <label htmlFor="quarter" className="text-sm">Quartal</label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="year" id="year" />
          <label htmlFor="year" className="text-sm">Jahr</label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default ScorecardTimeFrame;
