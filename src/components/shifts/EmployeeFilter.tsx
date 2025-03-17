
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EmployeeFilterProps {
  onFilterChange: (value: string) => void;
  defaultValue?: string;
}

const EmployeeFilter: React.FC<EmployeeFilterProps> = ({ 
  onFilterChange, 
  defaultValue = "aktiv" 
}) => {
  return (
    <Select defaultValue={defaultValue} onValueChange={onFilterChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="aktiv">Aktive Mitarbeiter</SelectItem>
        <SelectItem value="all">Alle Mitarbeiter</SelectItem>
        <SelectItem value="preferred">Bevorzugte Arbeitszeiten</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default EmployeeFilter;
