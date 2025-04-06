
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface ConcessionsWeekSelectorProps {
  selectedWeek: string | null;
  setSelectedWeek: (value: string) => void;
  availableWeeks: string[];
}

const ConcessionsWeekSelector: React.FC<ConcessionsWeekSelectorProps> = ({
  selectedWeek,
  setSelectedWeek,
  availableWeeks
}) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">Kalenderwoche:</span>
      <Select value={selectedWeek || ""} onValueChange={setSelectedWeek}>
        <SelectTrigger className="w-[180px] bg-white">
          <SelectValue placeholder="Woche auswählen" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {availableWeeks.map((week) => (
            <SelectItem key={week} value={week}>
              {week}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ConcessionsWeekSelector;
