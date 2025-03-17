
import React, { useState } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { de } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { initialEmployees } from "@/data/sampleEmployeeData";
import { Employee } from "@/types/employee";
import ShiftCell from "./ShiftCell";
import { Input } from "@/components/ui/input";

const ShiftSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(initialEmployees.filter(emp => emp.status === "Aktiv"));
  
  // Track required employees for each day (Mon-Sat)
  const [requiredEmployees, setRequiredEmployees] = useState<Record<number, number>>({
    0: 3, // Monday
    1: 3, // Tuesday
    2: 3, // Wednesday
    3: 3, // Thursday
    4: 3, // Friday
    5: 2, // Saturday
  });
  
  // Generate days of the week starting from Monday (6 days only, excluding Sunday)
  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(selectedWeek, i));
  
  // Calculate scheduled employees for each day
  // In a real app, this would count actual assignments
  const getScheduledEmployees = (dayIndex: number) => {
    // Simulate some values for the demo
    return Math.floor(Math.random() * 3) + 1;
  };
  
  const previousWeek = () => {
    const prevWeek = addDays(selectedWeek, -7);
    setSelectedWeek(prevWeek);
  };
  
  const nextWeek = () => {
    const nextWeek = addDays(selectedWeek, 7);
    setSelectedWeek(nextWeek);
  };
  
  const handleRequiredChange = (dayIndex: number, value: string) => {
    const numValue = parseInt(value) || 0;
    setRequiredEmployees(prev => ({
      ...prev,
      [dayIndex]: numValue
    }));
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={previousWeek}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <div className="flex items-center px-3 py-2 bg-muted rounded-md">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>
              {format(selectedWeek, "dd.MM.yyyy", { locale: de })} - {format(addDays(selectedWeek, 5), "dd.MM.yyyy", { locale: de })}
            </span>
          </div>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
        
        <Select defaultValue="aktiv">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aktiv">Aktive Mitarbeiter</SelectItem>
            <SelectItem value="all">Alle Mitarbeiter</SelectItem>
            <SelectItem value="preferred">Bevorzugte Arbeitszeiten</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left min-w-[200px]">
                <div>Mitarbeiter</div>
                <div className="mt-2 text-xs flex justify-between items-center">
                  <span>Forecast:</span>
                  <span className="text-xs ml-2">Geplant:</span>
                </div>
              </th>
              {weekDays.map((day, index) => (
                <th key={day.toString()} className="p-3 text-center border-l">
                  <div className="font-medium">
                    {format(day, "EEEE", { locale: de })}
                  </div>
                  <div className="text-sm font-normal">
                    {format(day, "dd.MM.", { locale: de })}
                  </div>
                  <div className="mt-1 flex justify-center space-x-2 items-center">
                    <Input
                      type="number"
                      min="0"
                      value={requiredEmployees[index]}
                      onChange={(e) => handleRequiredChange(index, e.target.value)}
                      className="w-10 h-6 text-center px-1"
                    />
                    <span className={`text-xs font-medium ${getScheduledEmployees(index) < requiredEmployees[index] ? 'text-red-500' : 'text-green-500'}`}>
                      {getScheduledEmployees(index)}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.id} className="border-t">
                <td className="p-3 font-medium">
                  {employee.name}
                  <div className="text-xs text-muted-foreground">
                    {employee.preferredWorkingDays.join(', ')}
                    {!employee.isWorkingDaysFlexible && (
                      <span className="ml-1 text-red-500 font-medium">
                        (nicht flexibel)
                      </span>
                    )}
                  </div>
                </td>
                {weekDays.map((day) => (
                  <td key={day.toString()} className="border-l p-0 h-14">
                    <ShiftCell 
                      employeeId={employee.id} 
                      date={format(day, "yyyy-MM-dd")}
                      preferredDays={employee.preferredWorkingDays}
                      dayOfWeek={format(day, "EEEEEE", { locale: de })}
                      isFlexible={employee.isWorkingDaysFlexible}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShiftSchedule;
