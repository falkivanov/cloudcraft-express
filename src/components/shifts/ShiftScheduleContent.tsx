
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
  
  // More detailed logging for debugging
  console.log("Tomorrow's date:", tomorrow ? format(tomorrow, 'yyyy-MM-dd') : 'Not found');
  console.log("Tomorrow's key:", tomorrowKey);
  console.log("All finalized days:", finalizedDays);
  console.log("Is tomorrow finalized check:", finalizedDays.includes(tomorrowKey));
  
  // Check if tomorrow is finalized
  const isTomorrowFinalized = finalizedDays.includes(tomorrowKey);
  
  // Get scheduled employees for tomorrow regardless of finalization status
  const scheduledForTomorrow = tomorrow ? getScheduledEmployeesForDay(tomorrowKey) : [];
  console.log("Scheduled employees for tomorrow:", scheduledForTomorrow.length);
  
  // Format the date for display
  const tomorrowDisplay = tomorrow 
    ? format(tomorrow, "EEEE, dd.MM.yyyy", { locale: de })
    : 'Morgen';

  // Simplified tab change handler
  const handleTabChange = (value: string) => {
    console.log("Tab change requested to:", value);
    console.log("Is tomorrow finalized currently:", isTomorrowFinalized);
    console.log("Finalized days:", finalizedDays);
    console.log("Tomorrow key:", tomorrowKey);
    
    // Only block if trying to access nextday tab when not finalized
    if (value === "nextday" && !isTomorrowFinalized) {
      console.log("Blocking tab change because tomorrow is not finalized");
      toast({
        title: "Dienstplan nicht finalisiert",
        description: "Der Dienstplan für morgen muss zuerst finalisiert werden.",
        variant: "destructive"
      });
      return; // Prevent tab change
    }
    
    // Allow tab change
    console.log("Allowing tab change to:", value);
    setActiveTab(value);
  };

  // For testing purposes - remove in production
  const manuallyFinalizeTomorrow = () => {
    if (tomorrow && tomorrowKey) {
      console.log("Manual finalization requested for:", tomorrowKey);
      handleFinalizeDay(tomorrowKey);
      console.log("After finalization, finalized days:", finalizedDays);
    }
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
        {/* Debug button - remove in production */}
        <div className="mb-4">
          <button 
            onClick={manuallyFinalizeTomorrow}
            className="px-3 py-1 bg-amber-100 text-amber-800 rounded-md text-xs"
          >
            Debug: Force finalize tomorrow ({isTomorrowFinalized ? "✓" : "✗"})
          </button>
        </div>
        
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
