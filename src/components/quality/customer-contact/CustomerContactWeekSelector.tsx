
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface CustomerContactWeekSelectorProps {
  selectedWeek: string;
  setSelectedWeek: (value: string) => void;
}

const CustomerContactWeekSelector: React.FC<CustomerContactWeekSelectorProps> = ({
  selectedWeek,
  setSelectedWeek
}) => {
  // Define the available weeks for Customer Contact data
  const availableWeeks = [
    {
      id: "week-13-2025",
      label: "KW 13 (aktuell)",
      weekNum: 13,
      year: 2025,
    },
    {
      id: "week-12-2025",
      label: "KW 12",
      weekNum: 12,
      year: 2025,
    },
    {
      id: "week-11-2025",
      label: "KW 11",
      weekNum: 11,
      year: 2025,
    },
    {
      id: "week-10-2025",
      label: "KW 10",
      weekNum: 10,
      year: 2025,
    },
  ];

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">Kalenderwoche:</span>
      <Select value={selectedWeek} onValueChange={setSelectedWeek}>
        <SelectTrigger className="w-[180px] bg-white">
          <SelectValue placeholder="Woche auswählen" />
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

export default CustomerContactWeekSelector;
