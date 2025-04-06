
import React from "react";
import { WeekOption } from "./hooks/types";
import WeekSelectorWithArrows from "../shared/WeekSelectorWithArrows";

interface CustomerContactWeekSelectorProps {
  selectedWeek: string;
  setSelectedWeek: (value: string) => void;
  availableWeeks: WeekOption[];
}

const CustomerContactWeekSelector: React.FC<CustomerContactWeekSelectorProps> = ({
  selectedWeek,
  setSelectedWeek,
  availableWeeks
}) => {
  return (
    <WeekSelectorWithArrows
      selectedWeek={selectedWeek}
      setSelectedWeek={setSelectedWeek}
      availableWeeks={availableWeeks}
    />
  );
};

export default CustomerContactWeekSelector;
