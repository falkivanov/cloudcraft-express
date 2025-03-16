
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";

interface EmployeeAdvancedFilterProps {
  workingDaysFilter: number | null;
  onWorkingDaysFilterChange: (value: number | null) => void;
  vehicleFilter: string;
  onVehicleFilterChange: (value: string) => void;
  uniqueVehicles: string[];
}

const EmployeeAdvancedFilter: React.FC<EmployeeAdvancedFilterProps> = ({
  workingDaysFilter,
  onWorkingDaysFilterChange,
  vehicleFilter,
  onVehicleFilterChange,
  uniqueVehicles
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
      <div className="w-full md:w-auto">
        <Label htmlFor="working-days-filter" className="mb-2 block">Arbeitstage pro Woche</Label>
        <Select
          value={workingDaysFilter?.toString() || "all"}
          onValueChange={(value) => 
            onWorkingDaysFilterChange(value === "all" ? null : parseInt(value))
          }
        >
          <SelectTrigger id="working-days-filter" className="w-[180px]">
            <SelectValue placeholder="Alle Tage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Tage</SelectItem>
            {[1, 2, 3, 4, 5, 6, 7].map((days) => (
              <SelectItem key={days} value={days.toString()}>
                {days} {days === 1 ? 'Tag' : 'Tage'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full md:w-auto">
        <Label htmlFor="vehicle-filter" className="mb-2 block">Bevorzugtes Fahrzeug</Label>
        <Select
          value={vehicleFilter || "all"}
          onValueChange={(value) => onVehicleFilterChange(value === "all" ? "" : value)}
        >
          <SelectTrigger id="vehicle-filter" className="w-[180px]">
            <SelectValue placeholder="Alle Fahrzeuge" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Fahrzeuge</SelectItem>
            {uniqueVehicles.map((vehicle) => (
              <SelectItem key={vehicle} value={vehicle}>
                {vehicle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default EmployeeAdvancedFilter;
