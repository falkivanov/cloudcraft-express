
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { WeekOption } from "./hooks/useCustomerContactWeek";

interface CustomerContactWeekSelectorProps {
  selectedWeek: string;
  setSelectedWeek: (value: string) => void;
  availableWeeks: WeekOption[];
}

const CustomerContactWeekSelector: React.FC<CustomerContactWeekSelectorProps> = ({
  selectedWeek,
  setSelectedWeek,
  availableWeeks
}) => {
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
