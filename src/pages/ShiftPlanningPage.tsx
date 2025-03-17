
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
      <div className="mb-6 flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedule" disabled={false}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Dienstplan
            </TabsTrigger>
            <TabsTrigger value="vehicles" disabled={!isScheduleFinalized}>
              <TruckIcon className="mr-2 h-4 w-4" />
              Fahrzeugzuordnung
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {activeTab === "schedule" && !isScheduleFinalized && (
          <Button onClick={handleFinalizeSchedule} className="bg-black hover:bg-gray-800">
            <CheckIcon className="mr-2 h-4 w-4" />
            Dienstplan abschließen
          </Button>
        )}
      </div>
      
      <TabsContent value="schedule" className="mt-0">
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
      
      <TabsContent value="vehicles" className="mt-0">
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
    </div>
  );
};

export default ShiftPlanningPage;
