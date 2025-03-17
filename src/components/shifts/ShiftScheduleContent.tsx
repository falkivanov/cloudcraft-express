import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ShiftSchedule from "@/components/shifts/ShiftSchedule";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NextDaySchedulePage from "./NextDaySchedulePage";
import { useShiftSchedule } from "./hooks/useShiftSchedule";
import { initialEmployees } from "@/data/sampleEmployeeData";
import { isTomorrow, format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";

const ShiftScheduleContent: React.FC = () => {
  // Default tab value
  const [activeTab, setActiveTab] = useState<string>("weekplan");
  
  const {
    weekDays,
    formatDateKey,
    finalizedDays,
    getScheduledEmployeesForDay,
    shiftsMap,
  } = useShiftSchedule(initialEmployees);
  
  // Find tomorrow's date directly from the weekDays array
  const tomorrow = weekDays.find(day => isTomorrow(day));
  const tomorrowKey = tomorrow ? formatDateKey(tomorrow) : '';
  
  // For debugging
  console.log("Tomorrow's date:", tomorrow ? format(tomorrow, 'yyyy-MM-dd') : 'Not found');
  console.log("Tomorrow's key:", tomorrowKey);
  console.log("Finalized days:", finalizedDays);
  console.log("Is tomorrow finalized:", finalizedDays.includes(tomorrowKey));
  
  // Check if tomorrow is finalized
  const isTomorrowFinalized = finalizedDays.includes(tomorrowKey);
  
  // Get scheduled employees for tomorrow regardless of finalization status
  const scheduledForTomorrow = tomorrow ? getScheduledEmployeesForDay(tomorrowKey) : [];
  console.log("Scheduled employees for tomorrow:", scheduledForTomorrow.length);
  
  // Format the date for display
  const tomorrowDisplay = tomorrow 
    ? format(tomorrow, "EEEE, dd.MM.yyyy", { locale: de })
    : 'Morgen';

  // Handle tab change - FIXED
  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value);
    console.log("Is tomorrow finalized (in handler):", isTomorrowFinalized);
    
    // Only show warning if trying to access nextday tab when not finalized
    if (value === "nextday" && !isTomorrowFinalized) {
      toast({
        title: "Dienstplan nicht finalisiert",
        description: "Der Dienstplan für morgen muss zuerst finalisiert werden.",
        variant: "destructive"
      });
      return; // Prevent tab change
    }
    
    // Otherwise allow tab change
    setActiveTab(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wochendienstplan</CardTitle>
        <CardDescription>
          Erstellen und bearbeiten Sie den Dienstplan für die kommende Woche.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="weekplan" className="flex-1">Wochendienstplan</TabsTrigger>
            <TabsTrigger 
              value="nextday" 
              className="flex-1"
            >
              Einsatzplan für {tomorrowDisplay}
              {!isTomorrowFinalized && tomorrow && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">Nicht finalisiert</span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekplan">
            <ShiftSchedule />
          </TabsContent>
          
          <TabsContent value="nextday">
            {tomorrow && (
              <NextDaySchedulePage 
                scheduledEmployees={scheduledForTomorrow} 
                date={tomorrow} 
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ShiftScheduleContent;
