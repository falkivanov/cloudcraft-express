
import React, { useState } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

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
  // Calculate max date (today) and min date (30 days ago)
  const today = new Date();
  const minDate = subDays(today, 30);
  
  // Parse the dateFilter string to a Date if it exists
  const selectedDate = dateFilter ? new Date(dateFilter) : undefined;
  
  // Handle calendar date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDateFilter(format(date, "yyyy-MM-dd"));
    } else {
      setDateFilter(null);
    }
  };

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
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                "min-w-[180px] justify-start text-left font-normal",
                !dateFilter && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "dd.MM.yyyy (EEEE)", { locale: de })
              ) : (
                "Datum wählen"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              fromDate={minDate}
              toDate={today}
              initialFocus
              className="pointer-events-auto"
              locale={de}
            />
          </PopoverContent>
        </Popover>
        
        <Select 
          value={selectedEmployee || undefined} 
          onValueChange={(value) => setSelectedEmployee(value === "all-employees" ? null : value)}
        >
          <SelectTrigger className="min-w-[180px]">
            <SelectValue placeholder="Mitarbeiter wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-employees">Alle Mitarbeiter</SelectItem>
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
