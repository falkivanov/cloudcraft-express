
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ShiftSchedule from "@/components/shifts/ShiftSchedule";
import VehicleAssignmentView from "@/components/shifts/VehicleAssignmentView";
import { Button } from "@/components/ui/button";
import { CalendarIcon, TruckIcon, CheckIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ShiftPlanningPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("schedule");
  const [isScheduleFinalized, setIsScheduleFinalized] = useState(false);
  
  const handleFinalizeSchedule = () => {
    // In a real app, this would save the schedule to the backend
    setIsScheduleFinalized(true);
    toast({
      title: "Dienstplan finalisiert",
      description: "Sie können jetzt mit der Fahrzeugzuordnung fortfahren.",
    });
    setActiveTab("vehicles");
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Schichtplanung</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="schedule" disabled={false}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Dienstplan
            </TabsTrigger>
            <TabsTrigger value="vehicles" disabled={!isScheduleFinalized}>
              <TruckIcon className="mr-2 h-4 w-4" />
              Fahrzeugzuordnung
            </TabsTrigger>
          </TabsList>
          
          {activeTab === "schedule" && !isScheduleFinalized && (
            <Button onClick={handleFinalizeSchedule}>
              <CheckIcon className="mr-2 h-4 w-4" />
              Dienstplan abschließen
            </Button>
          )}
        </div>
        
        <TabsContent value="schedule" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Wochendienstplan</CardTitle>
              <CardDescription>
                Erstellen und bearbeiten Sie den Dienstplan für die kommende Woche.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShiftSchedule />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vehicles" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Fahrzeugzuordnung</CardTitle>
              <CardDescription>
                Ordnen Sie den geplanten Mitarbeitern Fahrzeuge zu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VehicleAssignmentView isEnabled={isScheduleFinalized} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShiftPlanningPage;
