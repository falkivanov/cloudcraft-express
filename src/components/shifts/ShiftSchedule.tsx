
import React, { useState } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { de } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { initialEmployees } from "@/data/sampleEmployeeData";
import { Employee } from "@/types/employee";
import ShiftCell from "./ShiftCell";

const ShiftSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(initialEmployees.filter(emp => emp.status === "Aktiv"));
  
  // Generate days of the week starting from Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(selectedWeek, i));
  
  const previousWeek = () => {
    const prevWeek = addDays(selectedWeek, -7);
    setSelectedWeek(prevWeek);
  };
  
  const nextWeek = () => {
    const nextWeek = addDays(selectedWeek, 7);
    setSelectedWeek(nextWeek);
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
              {format(selectedWeek, "dd.MM.yyyy", { locale: de })} - {format(addDays(selectedWeek, 6), "dd.MM.yyyy", { locale: de })}
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
              <th className="p-3 text-left min-w-[200px]">Mitarbeiter</th>
              {weekDays.map((day) => (
                <th key={day.toString()} className="p-3 text-center border-l">
                  <div>{format(day, "EEEEEE", { locale: de })}</div>
                  <div className="text-sm">{format(day, "dd.MM.", { locale: de })}</div>
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
                  </div>
                </td>
                {weekDays.map((day) => (
                  <td key={day.toString()} className="border-l p-0 h-14">
                    <ShiftCell 
                      employeeId={employee.id} 
                      date={format(day, "yyyy-MM-dd")}
                      preferredDays={employee.preferredWorkingDays}
                      dayOfWeek={format(day, "EEEEEE", { locale: de })}
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
