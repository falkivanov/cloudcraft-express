
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

  return (
    <div className="mt-2 flex justify-center items-center space-x-3 rounded-md bg-background/70 p-1.5 shadow-sm">
      <div className="flex flex-col items-center">
        <span className="text-[10px] text-muted-foreground mb-0.5">Forecast</span>
        <Input
          type="number"
          min="0"
          value={requiredCount}
          onChange={(e) => onRequiredChange(e.target.value)}
          className="w-10 h-6 text-center px-1 text-xs font-medium border-muted-foreground/20"
        />
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[10px] text-muted-foreground mb-0.5">Geplant</span>
        <div className={`w-8 h-6 flex items-center justify-center rounded-md font-medium ${statusColor}`}>
          {scheduledCount}
        </div>
      </div>
    </div>
  );
};

export default RequiredEmployeesCell;
