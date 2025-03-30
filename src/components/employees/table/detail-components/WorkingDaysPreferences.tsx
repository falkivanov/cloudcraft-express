
import React from "react";
import { Calendar } from "lucide-react";
import DetailItem from "./DetailItem";

interface WorkingDaysPreferencesProps {
  weekDays: string[];
  preferredWorkingDays?: string[];
}

const WorkingDaysPreferences: React.FC<WorkingDaysPreferencesProps> = ({ 
  weekDays, 
  preferredWorkingDays 
}) => {
  return (
    <DetailItem
      icon={Calendar}
      label="Präferierte Arbeitstage"
      value={
        <div className="flex flex-wrap gap-1 mt-1">
          {weekDays.map((day) => (
            <span 
              key={day} 
              className={`text-xs px-2 py-1 rounded-full ${
                preferredWorkingDays?.includes(day) 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {day}
            </span>
          ))}
        </div>
      }
    />
  );
};

export default WorkingDaysPreferences;
