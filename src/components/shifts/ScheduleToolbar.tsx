
import React from "react";
import WeekNavigation from "./WeekNavigation";
import PlanningOptionsPopover from "./PlanningOptionsPopover";

type PlanningMode = "forecast" | "maximum";

interface ScheduleToolbarProps {
  selectedWeek: Date;
  previousWeek: () => void;
  nextWeek: () => void;
  planningMode: PlanningMode;
  setPlanningMode: (mode: PlanningMode) => void;
  onPlanNow: () => void;
  isAutoPlanningLoading: boolean;
  isPlanningOptionsOpen: boolean;
  setIsPlanningOptionsOpen: (open: boolean) => void;
}

const ScheduleToolbar: React.FC<ScheduleToolbarProps> = ({
  selectedWeek,
  previousWeek,
  nextWeek,
  planningMode,
  setPlanningMode,
  onPlanNow,
  isAutoPlanningLoading,
  isPlanningOptionsOpen,
  setIsPlanningOptionsOpen
}) => {
  return (
    <div className="flex justify-between items-center">
      <WeekNavigation 
        selectedWeek={selectedWeek}
        onPreviousWeek={previousWeek}
        onNextWeek={nextWeek}
      />
      
      <div className="flex items-center gap-2">
        <PlanningOptionsPopover
          planningMode={planningMode}
          setPlanningMode={setPlanningMode}
          onPlanNow={onPlanNow}
          isLoading={isAutoPlanningLoading}
          isPlanningOptionsOpen={isPlanningOptionsOpen}
          setIsPlanningOptionsOpen={setIsPlanningOptionsOpen}
        />
      </div>
    </div>
  );
};

export default ScheduleToolbar;
