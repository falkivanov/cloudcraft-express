
import React from "react";
import { initialEmployees } from "@/data/sampleEmployeeData";
import WeekNavigation from "./WeekNavigation";
import EmployeeFilter from "./EmployeeFilter";
import ScheduleTableHeader from "./ScheduleTableHeader";
import EmployeeRow from "./EmployeeRow";
import FlexibilityOverrideDialog from "./FlexibilityOverrideDialog";
import { useShiftSchedule } from "./hooks/useShiftSchedule";

const ShiftSchedule = () => {
  const {
    selectedWeek,
    weekDays,
    filteredEmployees,
    requiredEmployees,
    scheduledEmployees,
    formatDateKey,
    previousWeek,
    nextWeek,
    handleRequiredChange,
    handleFlexibilityOverride,
    confirmFlexibilityOverride,
    isTemporarilyFlexible,
    selectedEmployeeForFlexOverride,
    isFlexOverrideDialogOpen,
    setIsFlexOverrideDialogOpen
  } = useShiftSchedule(initialEmployees);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <WeekNavigation 
          selectedWeek={selectedWeek}
          onPreviousWeek={previousWeek}
          onNextWeek={nextWeek}
        />
        
        <EmployeeFilter onFilterChange={() => {}} />
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <ScheduleTableHeader 
            weekDays={weekDays}
            requiredEmployees={requiredEmployees}
            scheduledEmployees={scheduledEmployees}
            onRequiredChange={handleRequiredChange}
            formatDateKey={formatDateKey}
          />
          <tbody>
            {filteredEmployees.map((employee) => (
              <EmployeeRow
                key={employee.id}
                employee={employee}
                weekDays={weekDays}
                formatDateKey={formatDateKey}
                onFlexibilityOverride={handleFlexibilityOverride}
                isTemporarilyFlexible={isTemporarilyFlexible}
              />
            ))}
          </tbody>
        </table>
      </div>

      <FlexibilityOverrideDialog
        open={isFlexOverrideDialogOpen}
        onOpenChange={setIsFlexOverrideDialogOpen}
        employee={selectedEmployeeForFlexOverride}
        onConfirm={confirmFlexibilityOverride}
      />
    </div>
  );
};

export default ShiftSchedule;
