
import React from "react";
import { useVehicleAssignments } from "./hooks/useVehicleAssignments";
import VehicleAssignmentControls from "./components/VehicleAssignmentControls";
import VehicleAssignmentLegend from "./components/VehicleAssignmentLegend";
import VehicleAssignmentTable from "./components/VehicleAssignmentTable";

interface DailyVehicleAssignmentProps {
  isScheduleFinalized: boolean;
}

const DailyVehicleAssignment: React.FC<DailyVehicleAssignmentProps> = ({ isScheduleFinalized }) => {
  const {
    yesterdayAssignments,
    todayAssignments,
    tomorrowAssignments,
    overrideFinalized,
    setOverrideFinalized,
    effectivelyFinalized,
    handleAutoAssign,
    handleSaveAssignments,
    yesterdayDateKey,
    todayDateKey,
    tomorrowDateKey
  } = useVehicleAssignments(isScheduleFinalized);
  
  return (
    <div className="space-y-6 w-full">
      <VehicleAssignmentControls
        isScheduleFinalized={effectivelyFinalized}
        overrideFinalized={overrideFinalized}
        setOverrideFinalized={setOverrideFinalized}
        tomorrowAssignments={tomorrowAssignments}
        onAutoAssign={handleAutoAssign}
        onSaveAssignments={handleSaveAssignments}
      />
      
      <VehicleAssignmentLegend />
      
      <VehicleAssignmentTable
        todayAssignments={todayAssignments}
        tomorrowAssignments={tomorrowAssignments}
        yesterdayAssignments={yesterdayAssignments}
        yesterdayDateKey={yesterdayDateKey}
        todayDateKey={todayDateKey}
        tomorrowDateKey={tomorrowDateKey}
      />
    </div>
  );
};

export default DailyVehicleAssignment;
