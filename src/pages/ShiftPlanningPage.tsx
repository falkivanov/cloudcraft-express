
import React, { useEffect } from "react";
import ShiftPlanningHeader from "@/components/shifts/ShiftPlanningHeader";
import ShiftScheduleContent from "@/components/shifts/ShiftScheduleContent";
import VehicleAssignmentContent from "@/components/shifts/VehicleAssignmentContent";
import { useShiftPlanning } from "@/components/shifts/hooks/useShiftPlanning";
import { Container } from "@/components/ui/container";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { STORAGE_KEYS, loadFromStorage } from "@/utils/storageUtils";

const ShiftPlanningPage = () => {
  const { toast } = useToast();
  const { activeTab, setActiveTab, isScheduleFinalized, handleFinalizeSchedule } = useShiftPlanning();
  
  // Show confirmation message when page is loaded and shifts are restored
  useEffect(() => {
    try {
      const shiftsMapData = loadFromStorage(STORAGE_KEYS.SHIFTS_MAP);
      if (shiftsMapData) {
        const shiftsCount = Object.keys(shiftsMapData).length;
        
        if (shiftsCount > 0) {
          console.log(`Restored ${shiftsCount} shift assignments from previous session`);
          toast({
            title: "Dienstplan geladen",
            description: `${shiftsCount} Schichten wurden aus der vorherigen Planung wiederhergestellt.`,
          });
        }
      }
    } catch (error) {
      console.error('Error checking shift data on page load:', error);
    }
  }, [toast]);
  
  // Load the finalized status from localStorage when component mounts
  useEffect(() => {
    try {
      const savedIsScheduleFinalized = loadFromStorage<boolean>(STORAGE_KEYS.IS_SCHEDULE_FINALIZED);
      if (savedIsScheduleFinalized) {
        console.log("Schedule is already finalized, enabling vehicle tab");
      }
    } catch (error) {
      console.error('Error loading schedule finalized status from localStorage:', error);
    }
  }, []);
  
  return (
    <Container className="py-6">
      <ShiftPlanningHeader 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isScheduleFinalized={isScheduleFinalized}
        onFinalizeSchedule={handleFinalizeSchedule}
      />
      
      {activeTab === "schedule" && <ShiftScheduleContent />}
      {activeTab === "vehicles" && <VehicleAssignmentContent isEnabled={isScheduleFinalized} />}
    </Container>
  );
};

export default ShiftPlanningPage;
