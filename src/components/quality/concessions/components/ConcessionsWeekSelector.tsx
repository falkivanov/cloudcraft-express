
import React from "react";
import WeekSelectorWithArrows from "../../shared/WeekSelectorWithArrows";
import { WeekOption } from "../../customer-contact/hooks/types";

interface ConcessionsWeekSelectorProps {
  selectedWeek: string | null;
  setSelectedWeek: (value: string) => void;
  availableWeeks: string[];
}

const ConcessionsWeekSelector: React.FC<ConcessionsWeekSelectorProps> = ({
  selectedWeek,
  setSelectedWeek,
  availableWeeks
}) => {
  // Convert string array to WeekOption array
  const weekOptions: WeekOption[] = availableWeeks.map(week => ({
    id: week,
    label: week
  }));

  return (
    <WeekSelectorWithArrows
      selectedWeek={selectedWeek || ""}
      setSelectedWeek={setSelectedWeek}
      availableWeeks={weekOptions}
    />
  );
};

export default ConcessionsWeekSelector;
