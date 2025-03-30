
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

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
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="schedule">Dienstplan</TabsTrigger>
            <TabsTrigger 
              value="vehicles" 
              disabled={!isScheduleFinalized}
              title={!isScheduleFinalized ? "Bitte zuerst den Dienstplan finalisieren" : ""}
            >
              Fahrzeuge
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2">
          {activeTab === "schedule" && (
            <Button 
              onClick={onFinalizeSchedule}
              disabled={isScheduleFinalized}
            >
              {isScheduleFinalized ? "Dienstplan finalisiert" : "Dienstplan finalisieren"}
            </Button>
          )}
          
          <Button variant="outline" size="icon" asChild>
            <Link to="/settings" title="Einstellungen">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShiftPlanningHeader;
