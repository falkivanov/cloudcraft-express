
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ShiftSchedule from "@/components/shifts/ShiftSchedule";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NextDaySchedulePage from "./NextDaySchedulePage";
import { useShiftSchedule } from "./hooks/useShiftSchedule";
import { initialEmployees } from "@/data/sampleEmployeeData";

const ShiftScheduleContent: React.FC = () => {
  const {
    weekDays,
    formatDateKey,
    finalizedDays,
    getScheduledEmployeesForDay,
  } = useShiftSchedule(initialEmployees);
  
  // Finde den morgigen Tag, der finalisiert wurde
  const tomorrowIndex = weekDays.findIndex(day => {
    const dateKey = formatDateKey(day);
    return finalizedDays.includes(dateKey);
  });
  
  const nextDay = tomorrowIndex !== -1 ? weekDays[tomorrowIndex] : null;
  const nextDayKey = nextDay ? formatDateKey(nextDay) : '';
  const scheduledForNextDay = nextDay ? getScheduledEmployeesForDay(nextDayKey) : [];

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
          <TabsList className="mb-4">
            <TabsTrigger value="weekplan">Wochendienstplan</TabsTrigger>
            <TabsTrigger value="nextday" disabled={!nextDay}>
              Einsatzplan für {nextDay ? new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' }).format(nextDay) : 'morgen'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekplan">
            <ShiftSchedule />
          </TabsContent>
          
          <TabsContent value="nextday">
            {nextDay ? (
              <NextDaySchedulePage 
                scheduledEmployees={scheduledForNextDay} 
                date={nextDay} 
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Noch kein Einsatzplan für den nächsten Tag finalisiert.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ShiftScheduleContent;
