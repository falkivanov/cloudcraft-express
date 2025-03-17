
import React from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Employee } from "@/types/employee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        <Card className="overflow-hidden">
          <CardHeader className="bg-primary/5 pb-2">
            <CardTitle className="text-lg">Eingeplante Mitarbeiter</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-2">
              {scheduledEmployees.map((employee) => (
                <li key={employee.id} className="py-2 border-b last:border-b-0">
                  <span className="font-medium">{employee.name}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NextDaySchedulePage;
