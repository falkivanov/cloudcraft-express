
import React, { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { SunIcon, MoonIcon, Loader2Icon, PlusIcon, XCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShiftCellProps {
  employeeId: string;
  date: string;
  preferredDays: string[];
  dayOfWeek: string;
}

type ShiftType = "Früh" | "Spät" | "Nacht" | null;

const ShiftCell: React.FC<ShiftCellProps> = ({ employeeId, date, preferredDays, dayOfWeek }) => {
  const [shift, setShift] = useState<ShiftType>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const isPreferredDay = preferredDays.includes(dayOfWeek);
  
  const handleShiftSelect = (shiftType: ShiftType) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setShift(shiftType);
      setIsLoading(false);
    }, 300);
  };
  
  const getShiftIcon = () => {
    if (isLoading) return <Loader2Icon className="h-4 w-4 animate-spin" />;
    
    switch (shift) {
      case "Früh":
        return <SunIcon className="h-4 w-4 text-yellow-500" />;
      case "Spät":
        return <MoonIcon className="h-4 w-4 text-blue-500" />;
      case "Nacht":
        return <MoonIcon className="h-4 w-4 text-indigo-800" />;
      default:
        return <PlusIcon className="h-4 w-4" />;
    }
  };
  
  const getBackgroundColor = () => {
    switch (shift) {
      case "Früh":
        return "bg-yellow-50";
      case "Spät":
        return "bg-blue-50";
      case "Nacht":
        return "bg-indigo-50";
      default:
        return isPreferredDay ? "bg-green-50" : "";
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className={cn(
            "w-full h-full min-h-[3.5rem] flex items-center justify-center",
            getBackgroundColor()
          )}
          disabled={isLoading}
        >
          <div className="flex flex-col items-center">
            {getShiftIcon()}
            {shift && <span className="text-xs mt-1">{shift}</span>}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem onClick={() => handleShiftSelect("Früh")}>
          <SunIcon className="h-4 w-4 text-yellow-500 mr-2" />
          Frühschicht
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShiftSelect("Spät")}>
          <MoonIcon className="h-4 w-4 text-blue-500 mr-2" />
          Spätschicht
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShiftSelect("Nacht")}>
          <MoonIcon className="h-4 w-4 text-indigo-800 mr-2" />
          Nachtschicht
        </DropdownMenuItem>
        {shift && (
          <DropdownMenuItem onClick={() => handleShiftSelect(null)}>
            <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
            Löschen
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShiftCell;
