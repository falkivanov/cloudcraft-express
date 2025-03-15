
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface RepairDatesSectionProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

const RepairDatesSection = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}: RepairDatesSectionProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="repair-start-date">Startdatum</Label>
        <Input 
          id="repair-start-date" 
          type="date" 
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="repair-end-date">Enddatum</Label>
        <Input 
          id="repair-end-date" 
          type="date" 
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default RepairDatesSection;
