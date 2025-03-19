
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
  // Define the available weeks based on our uploaded data
  // Starting with KW10 2025 as the most recent since that's what we have
  const availableWeeks = [
    {
      id: "week-10-2025",
      label: "KW 10 (aktuell)",
      weekNum: 10,
      year: 2025,
      date: new Date(2025, 2, 3) // March 3, 2025 (approximate date for week 10)
    },
    {
      id: "week-9-2025",
      label: "KW 9",
      weekNum: 9,
      year: 2025,
      date: new Date(2025, 1, 26) // Feb 26, 2025
    },
    {
      id: "week-8-2025",
      label: "KW 8",
      weekNum: 8,
      year: 2025,
      date: new Date(2025, 1, 19) // Feb 19, 2025
    },
    {
      id: "week-7-2025",
      label: "KW 7",
      weekNum: 7,
      year: 2025,
      date: new Date(2025, 1, 12) // Feb 12, 2025
    },
    {
      id: "week-6-2025",
      label: "KW 6",
      weekNum: 6,
      year: 2025,
      date: new Date(2025, 1, 5) // Feb 5, 2025
    },
    {
      id: "week-5-2025",
      label: "KW 5",
      weekNum: 5,
      year: 2025,
      date: new Date(2025, 0, 29) // Jan 29, 2025
    },
    {
      id: "week-4-2025",
      label: "KW 4",
      weekNum: 4,
      year: 2025,
      date: new Date(2025, 0, 22) // Jan 22, 2025
    },
    {
      id: "week-3-2025",
      label: "KW 3",
      weekNum: 3,
      year: 2025,
      date: new Date(2025, 0, 15) // Jan 15, 2025
    },
  ];

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">Kalenderwoche:</span>
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
