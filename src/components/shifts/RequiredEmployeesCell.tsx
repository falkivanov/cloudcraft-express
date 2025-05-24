
import React from "react";
import { Input } from "@/components/ui/input";

interface RequiredEmployeesCellProps {
  requiredCount: number;
  scheduledCount: number;
  onRequiredChange: (value: string) => void;
}

const RequiredEmployeesCell: React.FC<RequiredEmployeesCellProps> = ({ 
  requiredCount, 
  scheduledCount, 
  onRequiredChange 
}) => {
  // Determine the status color based on the comparison
  const statusColor = scheduledCount < requiredCount 
    ? 'text-red-500 bg-red-50' 
    : scheduledCount > requiredCount 
      ? 'text-amber-500 bg-amber-50'
      : 'text-green-500 bg-green-50';

  // Convert 0 to empty string for display purposes
  const displayValue = requiredCount === 0 ? "" : requiredCount;

  return (
    <div className="mt-2 flex justify-center items-center space-x-2 rounded-md bg-background/70 p-1 shadow-sm">
      <div className="flex flex-col items-center">
        <span className="text-[9px] text-muted-foreground mb-0.5">Forecast</span>
        <Input
          type="number"
          min="0"
          value={displayValue}
          onChange={(e) => onRequiredChange(e.target.value)}
          className="w-10 h-5 text-center px-1 text-xs font-medium border-muted-foreground/20"
        />
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[9px] text-muted-foreground mb-0.5">Geplant</span>
        <div className={`w-7 h-5 flex items-center justify-center rounded-md font-medium text-xs ${statusColor}`}>
          {scheduledCount}
        </div>
      </div>
    </div>
  );
};

export default RequiredEmployeesCell;
