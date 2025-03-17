
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ShiftSchedule from "@/components/shifts/ShiftSchedule";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NextDaySchedulePage from "./NextDaySchedulePage";
import { useShiftSchedule } from "./hooks/useShiftSchedule";
import { initialEmployees } from "@/data/sampleEmployeeData";
import { isTomorrow, format } from "date-fns";
import { de } from "date-fns/locale";

const ShiftScheduleContent: React.FC = () => {
  const {
    weekDays,
    formatDateKey,
    finalizedDays,
    getScheduledEmployeesForDay,
  } = useShiftSchedule(initialEmployees);
  
  // Find tomorrow's date directly from the weekDays array
  const tomorrow = weekDays.find(day => isTomorrow(day));
  const tomorrowKey = tomorrow ? formatDateKey(tomorrow) : '';
  
  // For debugging
  console.log("Tomorrow's date:", tomorrow ? format(tomorrow, 'yyyy-MM-dd') : 'Not found');
  console.log("Tomorrow's key:", tomorrowKey);
  console.log("Finalized days:", finalizedDays);
  console.log("Is tomorrow finalized:", finalizedDays.includes(tomorrowKey));
  
  // Check if tomorrow is in our weekDays and if it has any scheduled employees
  const scheduledForTomorrow = tomorrow ? getScheduledEmployeesForDay(tomorrowKey) : [];
  console.log("Scheduled employees for tomorrow:", scheduledForTomorrow.length);
  
  // We'll show the tab even if not finalized, but indicate it's still in draft mode
  const isTomorrowFinalized = finalizedDays.includes(tomorrowKey);
  
  // Format the date for display
  const tomorrowDisplay = tomorrow 
    ? format(tomorrow, "EEEE, dd.MM.yyyy", { locale: de })
    : 'Morgen';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wochendienstplan</CardTitle>
        <CardDescription>
          Erstellen und bearbeiten Sie den Dienstplan für die kommende Woche.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekplan" className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="weekplan" className="flex-1">Wochendienstplan</TabsTrigger>
            <TabsTrigger value="nextday" className="flex-1" disabled={!tomorrow || scheduledForTomorrow.length === 0}>
              Einsatzplan für {tomorrowDisplay}
              {!isTomorrowFinalized && tomorrow && scheduledForTomorrow.length > 0 && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">Entwurf</span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekplan">
            <ShiftSchedule />
          </TabsContent>
          
          <TabsContent value="nextday">
            {tomorrow && scheduledForTomorrow.length > 0 ? (
              <NextDaySchedulePage 
                scheduledEmployees={scheduledForTomorrow} 
                date={tomorrow} 
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {!tomorrow 
                  ? "Der morgige Tag ist nicht in der aktuellen Wochenansicht."
                  : "Keine Mitarbeiter für morgen eingeplant."
                }
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ShiftScheduleContent;
