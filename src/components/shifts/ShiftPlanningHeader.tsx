
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, TruckIcon } from "lucide-react";

interface ShiftPlanningHeaderProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  isScheduleFinalized: boolean;
  onFinalizeSchedule: () => void;
}

const ShiftPlanningHeader: React.FC<ShiftPlanningHeaderProps> = ({
  activeTab,
  setActiveTab,
  isScheduleFinalized,
}) => {
  return (
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
    </div>
  );
};

export default ShiftPlanningHeader;
