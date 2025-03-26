
import React, { useEffect } from "react";
import ShiftPlanningHeader from "@/components/shifts/ShiftPlanningHeader";
import ShiftScheduleContent from "@/components/shifts/ShiftScheduleContent";
import VehicleAssignmentContent from "@/components/shifts/VehicleAssignmentContent";
import { useShiftPlanning } from "@/components/shifts/hooks/useShiftPlanning";
import { Container } from "@/components/ui/container";

const ShiftPlanningPage = () => {
  const { activeTab, setActiveTab, isScheduleFinalized, handleFinalizeSchedule } = useShiftPlanning();
  
  // Listen for day finalized events and update the tab if needed
  useEffect(() => {
    const handleDayFinalized = () => {
      // Wenn ein Tag finalisiert wird, automatisch zur Fahrzeugzuordnung wechseln
      console.log("Day finalized event detected, switching to vehicles tab");
      setActiveTab("vehicles");
    };
    
    window.addEventListener('dayFinalized', handleDayFinalized);
    
    return () => {
      window.removeEventListener('dayFinalized', handleDayFinalized);
    };
  }, [setActiveTab]);
  
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
    </Container>
  );
};

export default ShiftPlanningPage;
