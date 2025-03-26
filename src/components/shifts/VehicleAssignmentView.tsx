
import React, { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { TruckIcon, UserIcon, CalendarIcon, HistoryIcon, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { initialEmployees } from "@/data/sampleEmployeeData";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import DailyVehicleAssignment from "./vehicle-assignment/DailyVehicleAssignment";
import VehicleAssignmentHistory from "./vehicle-assignment/VehicleAssignmentHistory";
import { toast } from "sonner";

interface VehicleAssignmentViewProps {
  isEnabled: boolean;
}

const VehicleAssignmentView: React.FC<VehicleAssignmentViewProps> = ({ isEnabled }) => {
  const [activeTab, setActiveTab] = useState<"daily" | "history">("daily");
  const [localFinalized, setLocalFinalized] = useState(isEnabled);
  
  // Check for changes in the isEnabled prop
  useEffect(() => {
    setLocalFinalized(isEnabled);
    console.log("isEnabled prop changed:", isEnabled);
  }, [isEnabled]);
  
  // Listen for storage events that might update the finalized status
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedIsScheduleFinalized = localStorage.getItem('isScheduleFinalized');
        if (savedIsScheduleFinalized) {
          const newValue = JSON.parse(savedIsScheduleFinalized);
          setLocalFinalized(newValue);
          console.log("Schedule finalized status updated from storage:", newValue);
        }
      } catch (error) {
        console.error('Error reading schedule finalized status from localStorage:', error);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom dayFinalized events
    const handleDayFinalized = () => {
      setLocalFinalized(true);
      console.log("Day finalized event detected, updating local finalized state");
    };
    
    window.addEventListener('dayFinalized', handleDayFinalized);
    
    // Initial check from localStorage
    handleStorageChange();
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dayFinalized', handleDayFinalized);
    };
  }, []);
  
  if (!localFinalized) {
    return (
      <Alert className="mb-4">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>Dienstplan nicht finalisiert</AlertTitle>
        <AlertDescription>
          Um Fahrzeuge zuzuordnen, müssen Sie zuerst den Dienstplan finalisieren. 
          Bitte gehen Sie zurück zum Wochendienstplan und klicken Sie auf "Tag finalisieren" 
          für den morgigen Tag.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6 w-full">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "daily" | "history")} className="w-full">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Tägliche Zuordnung
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <HistoryIcon className="h-4 w-4" />
            Zuordnungshistorie
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="mt-0 w-full">
          <DailyVehicleAssignment isScheduleFinalized={localFinalized} />
        </TabsContent>
        
        <TabsContent value="history" className="mt-0 w-full">
          <VehicleAssignmentHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VehicleAssignmentView;
