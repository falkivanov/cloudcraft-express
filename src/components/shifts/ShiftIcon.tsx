
import React from "react";
import { ShiftType } from "./utils/shift-utils";
import { 
  PackageIcon, 
  SunIcon, 
  CalendarIcon, 
  UmbrellaIcon, 
  ThermometerIcon,
  Loader2Icon
} from "lucide-react";

interface ShiftIconProps {
  shift: ShiftType;
  isLoading?: boolean;
  className?: string;
}

const ShiftIcon: React.FC<ShiftIconProps> = ({ 
  shift, 
  isLoading = false,
  className = "h-5 w-5" 
}) => {
  if (isLoading) {
    return <Loader2Icon className={`${className} animate-spin text-gray-500`} />;
  }
  
  switch (shift) {
    case "Arbeit":
      return <PackageIcon className={`${className} text-blue-600`} />;
    case "Frei":
      return <SunIcon className={`${className} text-yellow-500`} />;
    case "Termin":
      return <CalendarIcon className={`${className} text-purple-500`} />;
    case "Urlaub":
      return <UmbrellaIcon className={`${className} text-green-500`} />;
    case "Krank":
      return <ThermometerIcon className={`${className} text-red-500`} />;
    default:
      return null;
  }
};

export default ShiftIcon;
