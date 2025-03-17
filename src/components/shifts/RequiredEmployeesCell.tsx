
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
  return (
    <div className="mt-1 flex justify-center space-x-2 items-center">
      <Input
        type="number"
        min="0"
        value={requiredCount}
        onChange={(e) => onRequiredChange(e.target.value)}
        className="w-10 h-6 text-center px-1"
      />
      <span className={`text-xs font-medium ${scheduledCount < requiredCount ? 'text-red-500' : 'text-green-500'}`}>
        {scheduledCount}
      </span>
    </div>
  );
};

export default RequiredEmployeesCell;
