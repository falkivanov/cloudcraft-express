
import React from "react";
import { ShiftType } from "./utils/shift-utils";
import { 
  BriefcaseIcon, 
  SunIcon, 
  CalendarIcon, 
  UmbrellaIcon, 
  ThermometerIcon, 
  Loader2Icon, 
  PlusIcon 
} from "lucide-react";

interface ShiftIconProps {
  shift: ShiftType;
  isLoading: boolean;
}

const ShiftIcon: React.FC<ShiftIconProps> = ({ shift, isLoading }) => {
  if (isLoading) return <Loader2Icon className="h-4 w-4 animate-spin" />;
  
  switch (shift) {
    case "Arbeit":
      return <BriefcaseIcon className="h-4 w-4 text-blue-600" />;
    case "Frei":
      return <SunIcon className="h-4 w-4 text-yellow-500" />;
    case "Termin":
      return <CalendarIcon className="h-4 w-4 text-purple-500" />;
    case "Urlaub":
      return <UmbrellaIcon className="h-4 w-4 text-green-500" />;
    case "Krank":
      return <ThermometerIcon className="h-4 w-4 text-red-500" />;
    default:
      return <PlusIcon className="h-4 w-4" />;
  }
};

export default ShiftIcon;
