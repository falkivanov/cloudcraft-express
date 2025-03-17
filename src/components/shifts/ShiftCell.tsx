
import React, { useState, useEffect } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { SunIcon, MoonIcon, Loader2Icon, PlusIcon, XCircleIcon, AlertTriangleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShiftAssignment } from "@/types/shift";
import { useToast } from "@/components/ui/use-toast";

interface ShiftCellProps {
  employeeId: string;
  date: string;
  preferredDays: string[];
  dayOfWeek: string;
  isFlexible?: boolean;
}

type ShiftType = "Früh" | "Spät" | "Nacht" | null;

const ShiftCell: React.FC<ShiftCellProps> = ({ 
  employeeId, 
  date, 
  preferredDays, 
  dayOfWeek,
  isFlexible = true 
}) => {
  const [shift, setShift] = useState<ShiftType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const isPreferredDay = preferredDays.includes(dayOfWeek);
  
  const handleShiftSelect = (shiftType: ShiftType) => {
    // Prüfen ob Eintrag an nicht-präferierten Tagen erlaubt ist
    if (shiftType !== null && !isPreferredDay && !isFlexible) {
      toast({
        title: "Nicht möglich",
        description: "Dieser Mitarbeiter kann nur an den angegebenen Arbeitstagen arbeiten.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setShift(shiftType);
      
      // Create a custom event to notify parent components about shift changes
      // This could be used to update the count of scheduled employees
      if (shiftType) {
        const assignment: ShiftAssignment = {
          id: `${employeeId}-${date}`,
          employeeId,
          date,
          shiftType: shiftType,
          confirmed: false
        };
        const event = new CustomEvent('shiftAssigned', { 
          detail: { assignment, action: 'add' }
        });
        document.dispatchEvent(event);
      } else {
        const event = new CustomEvent('shiftAssigned', { 
          detail: { 
            assignment: { employeeId, date },
            action: 'remove' 
          }
        });
        document.dispatchEvent(event);
      }
      
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
    if (!isFlexible && !isPreferredDay) {
      return "bg-gray-100"; // Grauer Hintergrund für nicht verfügbare Tage
    }
    
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
  
  // Wenn der Mitarbeiter nicht flexibel ist und es kein präferierter Tag ist,
  // zeigen wir eine spezielle UI an
  if (!isFlexible && !isPreferredDay) {
    return (
      <div 
        className="w-full h-full min-h-[3.5rem] flex items-center justify-center bg-gray-100"
        title="Mitarbeiter ist an diesem Tag nicht verfügbar"
      >
        <div className="flex flex-col items-center text-gray-400">
          <AlertTriangleIcon className="h-4 w-4" />
          <span className="text-xs mt-1">Nicht verfügbar</span>
        </div>
      </div>
    );
  }
  
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
