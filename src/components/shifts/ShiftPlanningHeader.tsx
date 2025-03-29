
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface ShiftPlanningHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isScheduleFinalized: boolean;
  onFinalizeSchedule: () => void;
}

const ShiftPlanningHeader: React.FC<ShiftPlanningHeaderProps> = ({
  activeTab,
  setActiveTab,
  isScheduleFinalized,
  onFinalizeSchedule
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
      <h1 className="text-2xl font-bold">Dienstplanung</h1>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="schedule">Dienstplan</TabsTrigger>
            <TabsTrigger 
              value="vehicles" 
              disabled={!isScheduleFinalized}
              title={!isScheduleFinalized ? "Bitte zuerst den Dienstplan finalisieren" : ""}
            >
              Fahrzeuge
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Einstellungen
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {activeTab === "schedule" && (
          <Button 
            onClick={onFinalizeSchedule}
            disabled={isScheduleFinalized}
          >
            {isScheduleFinalized ? "Dienstplan finalisiert" : "Dienstplan finalisieren"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ShiftPlanningHeader;
