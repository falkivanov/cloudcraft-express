
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
    handleFinalizeDay,
  } = useShiftSchedule(initialEmployees);
  
  // Find tomorrow's date directly from the weekDays array
  const tomorrow = weekDays.find(day => isTomorrow(day));
  const tomorrowKey = tomorrow ? formatDateKey(tomorrow) : '';
  
  // Check if tomorrow is finalized
  const isTomorrowFinalized = finalizedDays.includes(tomorrowKey);
  
  // Get scheduled employees for tomorrow regardless of finalization status
  const scheduledForTomorrow = tomorrow ? getScheduledEmployeesForDay(tomorrowKey) : [];
  
  // Format the date for display
  const tomorrowDisplay = tomorrow 
    ? format(tomorrow, "EEEE, dd.MM.yyyy", { locale: de })
    : 'Morgen';

  // Custom finalize handler that shows confirmation toast and updates UI
  const handleFinalizeTomorrowDay = (dateKey: string) => {
    handleFinalizeDay(dateKey);
    
    // Show confirmation toast
    toast({
      title: "Dienstplan finalisiert",
      description: `Der Dienstplan für ${tomorrowDisplay} wurde erfolgreich finalisiert.`,
    });
  };

  // Listen for day finalized event to switch to nextday tab
  useEffect(() => {
    const handleDayFinalized = (event: Event) => {
      try {
        const customEvent = event as CustomEvent;
        const { shouldSwitchToNextDay } = customEvent.detail;
        
        if (shouldSwitchToNextDay && tomorrow) {
          console.log("Day finalized event with shouldSwitchToNextDay flag detected, switching to nextday tab");
          setActiveTab("nextday");
        }
      } catch (error) {
        console.error('Error handling dayFinalized event in ShiftScheduleContent:', error);
      }
    };
    
    window.addEventListener('dayFinalized', handleDayFinalized);
    
    return () => {
      window.removeEventListener('dayFinalized', handleDayFinalized);
    };
  }, [tomorrow]);

  // Tab change handler
  const handleTabChange = (value: string) => {
    // If trying to access nextday tab when not finalized, show toast with helpful message
    if (value === "nextday" && !isTomorrowFinalized) {
      toast({
        title: "Dienstplan nicht finalisiert",
        description: `Der Dienstplan für ${tomorrowDisplay} muss zuerst finalisiert werden. Bitte benutzen Sie den "Tag finalisieren" Button in der Tabelle.`,
        variant: "destructive"
      });
      return; // Prevent tab change
    }
    
    // Allow tab change
    setActiveTab(value);
  };

  return (
    <Card className="w-full">
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
