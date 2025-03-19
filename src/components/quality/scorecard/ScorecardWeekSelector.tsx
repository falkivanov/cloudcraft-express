
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { formatDate } from "@/utils/dateUtils";

interface ScorecardWeekSelectorProps {
  selectedWeek: string;
  setSelectedWeek: (value: string) => void;
}

const ScorecardWeekSelector: React.FC<ScorecardWeekSelectorProps> = ({
  selectedWeek,
  setSelectedWeek
}) => {
  // Generate available weeks (last 10 weeks)
  const currentDate = new Date();
  const availableWeeks = Array.from({ length: 10 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7));
    const weekNum = Math.ceil((((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000) + 1) / 7);
    return {
      id: i === 0 ? "current" : `week-${weekNum}-${date.getFullYear()}`,
      label: i === 0 ? `KW ${weekNum} (aktuell)` : `KW ${weekNum}`,
      weekNum,
      year: date.getFullYear(),
      date
    };
  });

  return (
    <div className="flex items-center">
      <Select value={selectedWeek} onValueChange={setSelectedWeek}>
        <SelectTrigger className="w-[180px] bg-white">
          <SelectValue placeholder="Woche auswählen" />
        </SelectTrigger>
        <SelectContent className="bg-popover">
          {availableWeeks.map((week) => (
            <SelectItem key={week.id} value={week.id}>
              {week.label} ({formatDate(week.date.toISOString())})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ScorecardWeekSelector;
