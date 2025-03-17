
import React from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Employee } from "@/types/employee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneIcon, AtSignIcon } from "lucide-react";

interface NextDaySchedulePageProps {
  scheduledEmployees: Employee[];
  date: Date;
}

const NextDaySchedulePage: React.FC<NextDaySchedulePageProps> = ({ 
  scheduledEmployees, 
  date
}) => {
  const formattedDate = format(date, "EEEE, dd.MM.yyyy", { locale: de });
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Einsatzplan für {formattedDate}
        </h2>
        <div className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
          {scheduledEmployees.length} Mitarbeiter eingeplant
        </div>
      </div>

      {scheduledEmployees.length === 0 ? (
        <div className="bg-muted rounded-lg p-8 text-center">
          <p className="text-muted-foreground text-lg">Keine Mitarbeiter für diesen Tag eingeplant.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scheduledEmployees.map((employee) => (
            <Card key={employee.id} className="overflow-hidden">
              <CardHeader className="bg-primary/5 pb-3">
                <CardTitle className="text-lg">{employee.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {employee.telegramUsername && (
                    <div className="flex items-center">
                      <AtSignIcon className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-blue-500">@{employee.telegramUsername}</span>
                    </div>
                  )}
                  {employee.phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{employee.phone}</span>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground mt-2">
                    <span className="font-medium">Bevorzugte Tage:</span> {employee.preferredWorkingDays.join(", ")}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NextDaySchedulePage;
