
import React from "react";
import { AlertTriangle } from "lucide-react";

interface FocusAreasCardProps {
  focusAreas: string[];
  previousFocusAreas?: string[];
}

const FocusAreasCard: React.FC<FocusAreasCardProps> = ({ 
  focusAreas, 
  previousFocusAreas = [] 
}) => {
  return (
    <div className="bg-white rounded-lg border p-3">
      <div className="flex items-center mb-1">
        <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
        <h3 className="text-sm font-medium">Focus Areas</h3>
      </div>
      <ul className="text-xs space-y-0.5 list-inside list-disc">
        {focusAreas.map((area, index) => (
          <li 
            key={index} 
            className={`text-gray-700 truncate ${
              previousFocusAreas.includes(area) 
                ? "font-medium text-amber-700" 
                : ""
            }`}
          >
            {area}
            {previousFocusAreas.includes(area) && 
              <span className="ml-1 text-[9px] text-gray-500">(wiederholt)</span>
            }
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FocusAreasCard;
