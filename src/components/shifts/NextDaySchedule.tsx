
import React from "react";
import { format, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Employee } from "@/types/employee";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface NextDayScheduleProps {
  scheduledEmployees: Employee[];
  date: Date;
  onClose: () => void;
}

const NextDaySchedule: React.FC<NextDayScheduleProps> = ({ 
  scheduledEmployees, 
  date,
  onClose
}) => {
  const formattedDate = format(date, "EEEE, dd.MM.yyyy", { locale: de });
  
  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">
          Einsatzplan für {formattedDate}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {scheduledEmployees.length === 0 ? (
          <p className="text-muted-foreground">Keine Mitarbeiter eingeplant.</p>
        ) : (
          <div className="space-y-2">
            <div className="font-semibold text-sm text-muted-foreground mb-2">
              {scheduledEmployees.length} Mitarbeiter eingeplant:
            </div>
            <ul className="divide-y">
              {scheduledEmployees.map((employee) => (
                <li key={employee.id} className="py-2 flex justify-between">
                  <div>
                    <span className="font-medium">{employee.name}</span>
                    <div className="text-sm text-muted-foreground">
                      {employee.telegramUsername && (
                        <span className="text-blue-500">@{employee.telegramUsername}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {employee.phone}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NextDaySchedule;
