
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useAvailableWeeks } from "../hooks/useAvailableWeeks";

interface MentorWeekSelectorProps {
  selectedWeek: string;
  setSelectedWeek: (value: string) => void;
}

const MentorWeekSelector: React.FC<MentorWeekSelectorProps> = ({
  selectedWeek,
  setSelectedWeek
}) => {
  const { availableWeeks } = useAvailableWeeks({ selectedWeek, setSelectedWeek });

  const handleWeekChange = (weekId: string) => {
    console.log(`Week selected from dropdown: ${weekId}`);
    setSelectedWeek(weekId);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">Kalenderwoche:</span>
      <Select value={selectedWeek} onValueChange={handleWeekChange}>
        <SelectTrigger className="w-[180px] bg-white">
          <SelectValue placeholder="Woche auswählen..." />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {availableWeeks.map((week) => (
            <SelectItem key={week.id} value={week.id}>
              {week.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MentorWeekSelector;
