
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useShiftPlanning = () => {
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

  return {
    activeTab,
    setActiveTab,
    isScheduleFinalized,
    handleFinalizeSchedule
  };
};
