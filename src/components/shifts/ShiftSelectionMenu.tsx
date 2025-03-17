
import React from "react";
import { ShiftType } from "./utils/shift-utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  BriefcaseIcon, 
  SunIcon, 
  CalendarIcon, 
  UmbrellaIcon, 
  ThermometerIcon, 
  XCircleIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";
import ShiftIcon from "./ShiftIcon";

interface ShiftSelectionMenuProps {
  shift: ShiftType;
  isLoading: boolean;
  backgroundColorClass: string;
  onShiftSelect: (shiftType: ShiftType) => void;
}

const ShiftSelectionMenu: React.FC<ShiftSelectionMenuProps> = ({ 
  shift, 
  isLoading, 
  backgroundColorClass,
  onShiftSelect 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className={cn(
            "w-full h-full min-h-[3.5rem] flex items-center justify-center",
            backgroundColorClass
          )}
        >
          <div className="flex flex-col items-center">
            <ShiftIcon shift={shift} isLoading={isLoading} />
            {shift && <span className="text-xs mt-1">{shift}</span>}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem onClick={() => onShiftSelect("Arbeit")}>
          <BriefcaseIcon className="h-4 w-4 text-blue-600 mr-2" />
          Arbeit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShiftSelect("Frei")}>
          <SunIcon className="h-4 w-4 text-yellow-500 mr-2" />
          Frei
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShiftSelect("Termin")}>
          <CalendarIcon className="h-4 w-4 text-purple-500 mr-2" />
          Termin
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShiftSelect("Urlaub")}>
          <UmbrellaIcon className="h-4 w-4 text-green-500 mr-2" />
          Urlaub
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShiftSelect("Krank")}>
          <ThermometerIcon className="h-4 w-4 text-red-500 mr-2" />
          Krank
        </DropdownMenuItem>
        {shift && (
          <DropdownMenuItem onClick={() => onShiftSelect(null)}>
            <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
            Löschen
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShiftSelectionMenu;
