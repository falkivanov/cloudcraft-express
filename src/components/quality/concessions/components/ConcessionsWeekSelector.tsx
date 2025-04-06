
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
  // Convert string array to WeekOption array with proper formatting including year
  const weekOptions: WeekOption[] = availableWeeks.map(week => {
    // Try to extract year if the format contains it
    const yearMatch = week.match(/(\d{4})/);
    const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
    
    return {
      id: week,
      label: week.includes(year) ? week : `${week}/${year}`
    };
  });

  return (
    <WeekSelectorWithArrows
      selectedWeek={selectedWeek || ""}
      setSelectedWeek={setSelectedWeek}
      availableWeeks={weekOptions}
    />
  );
};

export default ConcessionsWeekSelector;
