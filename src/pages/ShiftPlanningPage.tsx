
import React, { useEffect, useState } from "react";
import ShiftPlanningHeader from "@/components/shifts/ShiftPlanningHeader";
import ShiftScheduleContent from "@/components/shifts/ShiftScheduleContent";
import VehicleAssignmentContent from "@/components/shifts/VehicleAssignmentContent";
import RegionSettings from "@/components/shifts/settings/RegionSettings";
import { useShiftPlanning } from "@/components/shifts/hooks/useShiftPlanning";
import { Container } from "@/components/ui/container";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

const ShiftPlanningPage = () => {
  const { toast } = useToast();
  const { activeTab, setActiveTab, isScheduleFinalized, handleFinalizeSchedule } = useShiftPlanning();
  
  // Show confirmation message when page is loaded and shifts are restored
  useEffect(() => {
    try {
      const shiftsMapData = localStorage.getItem('shiftsMap');
      if (shiftsMapData) {
        const shiftsObject = JSON.parse(shiftsMapData);
        const shiftsCount = Object.keys(shiftsObject).length;
        
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
  
  // Listen for day finalized events, but don't automatically switch tabs
  useEffect(() => {
    const handleDayFinalized = (event: Event) => {
      // We don't want to automatically switch to vehicles tab anymore
      console.log("Day finalized event detected, but not switching tabs automatically");
      
      // Instead we let the ShiftScheduleContent handle the tab change internally
    };
    
    window.addEventListener('dayFinalized', handleDayFinalized);
    
    return () => {
      window.removeEventListener('dayFinalized', handleDayFinalized);
    };
  }, []);
  
  // Load the finalized status from localStorage when component mounts
  useEffect(() => {
    try {
      const savedIsScheduleFinalized = localStorage.getItem('isScheduleFinalized');
      if (savedIsScheduleFinalized && JSON.parse(savedIsScheduleFinalized)) {
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
      {activeTab === "settings" && <RegionSettings />}
    </Container>
  );
};

export default ShiftPlanningPage;
