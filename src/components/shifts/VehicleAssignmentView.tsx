
import React, { useState } from "react";
import { format, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { TruckIcon, UserIcon, CalendarIcon, HistoryIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { initialEmployees } from "@/data/sampleEmployeeData";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DailyVehicleAssignment from "./vehicle-assignment/DailyVehicleAssignment";
import VehicleAssignmentHistory from "./vehicle-assignment/VehicleAssignmentHistory";

interface VehicleAssignmentViewProps {
  isEnabled: boolean;
}

const VehicleAssignmentView: React.FC<VehicleAssignmentViewProps> = ({ isEnabled }) => {
  const [activeTab, setActiveTab] = useState<"daily" | "history">("daily");
  
  if (!isEnabled) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <TruckIcon className="mx-auto h-16 w-16 mb-4 opacity-20" />
        <h3 className="text-lg font-semibold mb-2">Fahrzeugzuordnung nicht verfügbar</h3>
        <p>Bitte finalisieren Sie zuerst den Dienstplan, um Fahrzeuge zuordnen zu können.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "daily" | "history")}>
        <TabsList className="mb-4">
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Tägliche Zuordnung
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <HistoryIcon className="h-4 w-4" />
            Zuordnungshistorie
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="mt-0">
          <DailyVehicleAssignment />
        </TabsContent>
        
        <TabsContent value="history" className="mt-0">
          <VehicleAssignmentHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VehicleAssignmentView;
