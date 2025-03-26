
import React from "react";
import { format, subDays } from "date-fns";
import { de } from "date-fns/locale";
import { Search, Calendar } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Employee } from "@/types/employee";

interface VehicleAssignmentFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dateFilter: string | null;
  setDateFilter: (date: string | null) => void;
  selectedEmployee: string | null;
  setSelectedEmployee: (employeeId: string | null) => void;
  employees: Employee[];
}

const VehicleAssignmentFilters: React.FC<VehicleAssignmentFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  dateFilter,
  setDateFilter,
  selectedEmployee,
  setSelectedEmployee,
  employees
}) => {
  // Generieren von Datumswerten für die letzten 30 Tage
  const dateOptions = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), i);
    return {
      value: format(date, "yyyy-MM-dd"),
      label: format(date, "dd.MM.yyyy (EEEE)", { locale: de })
    };
  });

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Suche nach Mitarbeiter oder Fahrzeug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={dateFilter || ""} onValueChange={(value) => setDateFilter(value || null)}>
          <SelectTrigger className="min-w-[180px]">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <SelectValue placeholder="Datum wählen" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Alle Datums</SelectItem>
            {dateOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select 
          value={selectedEmployee || ""} 
          onValueChange={(value) => setSelectedEmployee(value || null)}
        >
          <SelectTrigger className="min-w-[180px]">
            <SelectValue placeholder="Mitarbeiter wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Alle Mitarbeiter</SelectItem>
            {employees.map(employee => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          onClick={() => {
            setSearchQuery("");
            setDateFilter(null);
            setSelectedEmployee(null);
          }}
        >
          Zurücksetzen
        </Button>
      </div>
    </div>
  );
};

export default VehicleAssignmentFilters;
