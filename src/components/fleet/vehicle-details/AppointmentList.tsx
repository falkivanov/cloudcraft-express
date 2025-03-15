
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Appointment } from "@/types/vehicle";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface AppointmentListProps {
  appointments: Appointment[];
  onCompleteToggle: (appointmentId: string) => void;
}

const AppointmentList = ({ appointments, onCompleteToggle }: AppointmentListProps) => {
  const formatDateString = (dateString: string | null): string => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return format(date, 'dd.MM.yyyy', { locale: de });
    } catch (error) {
      console.error("Invalid date format", error);
      return dateString;
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {!appointments.length ? (
          <div className="text-center py-6 text-muted-foreground">
            Keine Termine gefunden
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className={cn("bg-muted/30", appointment.completed && "bg-muted/10")}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">
                        {formatDateString(appointment.date)}, {appointment.time} Uhr
                      </CardTitle>
                      {appointment.completed && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Erledigt
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {appointment.appointmentType}
                      {appointment.location && ` • ${appointment.location}`}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm">{appointment.description}</p>
                </CardContent>
                <CardFooter className="flex justify-end pt-0">
                  <Button 
                    variant={appointment.completed ? "outline" : "default"} 
                    size="sm"
                    onClick={() => onCompleteToggle(appointment.id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {appointment.completed ? "Auf nicht erledigt setzen" : "Als erledigt markieren"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentList;
