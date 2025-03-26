
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
  // Define the available weeks for Customer Contact data, including KW12
  const availableWeeks = [
    {
      id: "week-12-2025",
      label: "KW 12 (aktuell)",
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
    {
      id: "week-9-2025",
      label: "KW 9",
      weekNum: 9,
      year: 2025,
    },
    {
      id: "week-8-2025",
      label: "KW 8",
      weekNum: 8,
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
        <SelectContent className="bg-white z-50">
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
