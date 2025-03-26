
import React from "react";
import ShiftPlanningHeader from "@/components/shifts/ShiftPlanningHeader";
import ShiftScheduleContent from "@/components/shifts/ShiftScheduleContent";
import VehicleAssignmentContent from "@/components/shifts/VehicleAssignmentContent";
import { useShiftPlanning } from "@/components/shifts/hooks/useShiftPlanning";
import { Container } from "@/components/ui/container";

const ShiftPlanningPage = () => {
  const { activeTab, setActiveTab, isScheduleFinalized, handleFinalizeSchedule } = useShiftPlanning();
  
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
