
import React, { useState } from "react";
import { format, subDays } from "date-fns";
import { de } from "date-fns/locale";
import { Search, Calendar, ChevronsUpDown } from "lucide-react";
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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

  // State for employee dropdown
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");

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
                format(selectedDate, "dd.MM.yyyy", { locale: de })
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
        
        <Popover open={employeeOpen} onOpenChange={setEmployeeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={employeeOpen}
              className="min-w-[180px] justify-between"
            >
              {selectedEmployee 
                ? employees.find((employee) => employee.id === selectedEmployee)?.name || "Mitarbeiter wählen"
                : "Alle Mitarbeiter"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0">
            <Command>
              <CommandInput 
                placeholder="Mitarbeiter suchen..." 
                className="h-9"
                value={employeeSearch}
                onValueChange={setEmployeeSearch}
              />
              <CommandList>
                <CommandEmpty>Kein Mitarbeiter gefunden.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="all-employees"
                    onSelect={() => {
                      setSelectedEmployee(null);
                      setEmployeeOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        !selectedEmployee ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Alle Mitarbeiter
                  </CommandItem>
                  {employees
                    .filter(employee => 
                      employee.name.toLowerCase().includes(employeeSearch.toLowerCase()))
                    .map(employee => (
                      <CommandItem
                        key={employee.id}
                        value={employee.id}
                        onSelect={() => {
                          setSelectedEmployee(employee.id);
                          setEmployeeOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedEmployee === employee.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {employee.name}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
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
