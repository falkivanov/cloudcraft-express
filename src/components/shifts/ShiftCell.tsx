
import React, { useState, useEffect } from "react";
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
  Loader2Icon, 
  PlusIcon, 
  XCircleIcon, 
  AlertTriangleIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ShiftAssignment } from "@/types/shift";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ShiftCellProps {
  employeeId: string;
  date: string;
  preferredDays: string[];
  dayOfWeek: string;
  isFlexible?: boolean;
}

type ShiftType = "Arbeit" | "Frei" | "Termin" | "Urlaub" | "Krank" | null;

const ShiftCell: React.FC<ShiftCellProps> = ({ 
  employeeId, 
  date, 
  preferredDays, 
  dayOfWeek,
  isFlexible = true 
}) => {
  const [shift, setShift] = useState<ShiftType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [pendingShiftChange, setPendingShiftChange] = useState<ShiftType>(null);
  const { toast } = useToast();
  
  const isPreferredDay = preferredDays.includes(dayOfWeek);
  
  const handleShiftSelect = (shiftType: ShiftType) => {
    // Only show dialog when changing from "Termin" to something else
    if (shift === "Termin" && shiftType !== shift) {
      setPendingShiftChange(shiftType);
      setShowRemoveDialog(true);
      return;
    }
    
    if (shiftType !== null && !isPreferredDay && !isFlexible) {
      toast({
        title: "Nicht möglich",
        description: "Dieser Mitarbeiter kann nur an den angegebenen Arbeitstagen arbeiten.",
        variant: "destructive",
      });
      return;
    }
    
    // Apply the shift change immediately (for non-Termin shifts)
    setShift(shiftType);
    
    // Create and dispatch events for non-Termin shifts
    if (shiftType) {
      const assignment: ShiftAssignment = {
        id: `${employeeId}-${date}`,
        employeeId,
        date,
        shiftType: shiftType,
        confirmed: false
      };
      
      try {
        document.dispatchEvent(new CustomEvent('shiftAssigned', { 
          detail: { 
            assignment, 
            action: 'add',
            countAsScheduled: shiftType === "Arbeit"
          }
        }));
      } catch (error) {
        console.error("Error dispatching shiftAssigned event:", error);
      }
    } else {
      try {
        document.dispatchEvent(new CustomEvent('shiftAssigned', { 
          detail: { 
            assignment: { employeeId, date },
            action: 'remove' 
          }
        }));
      } catch (error) {
        console.error("Error dispatching shiftAssigned event:", error);
      }
    }
  };
  
  const handleRemoveDialogConfirm = () => {
    // Close dialog first before making any changes
    setShowRemoveDialog(false);
    
    // Update the shift state
    setShift(pendingShiftChange);
    
    // Create and dispatch the event for a confirmed Termin change
    if (pendingShiftChange) {
      const assignment: ShiftAssignment = {
        id: `${employeeId}-${date}`,
        employeeId,
        date,
        shiftType: pendingShiftChange,
        confirmed: false
      };
      
      try {
        document.dispatchEvent(new CustomEvent('shiftAssigned', { 
          detail: { 
            assignment, 
            action: 'add',
            countAsScheduled: pendingShiftChange === "Arbeit"
          }
        }));
      } catch (error) {
        console.error("Error dispatching shiftAssigned event:", error);
      }
    } else {
      try {
        document.dispatchEvent(new CustomEvent('shiftAssigned', { 
          detail: { 
            assignment: { employeeId, date },
            action: 'remove' 
          }
        }));
      } catch (error) {
        console.error("Error dispatching shiftAssigned event:", error);
      }
    }
    
    // Reset pending shift change
    setPendingShiftChange(null);
  };
  
  const handleRemoveDialogCancel = () => {
    setShowRemoveDialog(false);
    setPendingShiftChange(null);
  };

  const getShiftIcon = () => {
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
  
  const getBackgroundColor = () => {
    if (!isFlexible && !isPreferredDay) {
      return "bg-gray-100";
    }
    
    switch (shift) {
      case "Arbeit":
        return "bg-blue-50";
      case "Frei":
        return "bg-yellow-50";
      case "Termin":
        return "bg-purple-50";
      case "Urlaub":
        return "bg-green-50";
      case "Krank":
        return "bg-red-50";
      default:
        return isPreferredDay ? "bg-green-50" : "";
    }
  };
  
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
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button 
            className={cn(
              "w-full h-full min-h-[3.5rem] flex items-center justify-center",
              getBackgroundColor()
            )}
          >
            <div className="flex flex-col items-center">
              {getShiftIcon()}
              {shift && <span className="text-xs mt-1">{shift}</span>}
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuItem onClick={() => handleShiftSelect("Arbeit")}>
            <BriefcaseIcon className="h-4 w-4 text-blue-600 mr-2" />
            Arbeit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShiftSelect("Frei")}>
            <SunIcon className="h-4 w-4 text-yellow-500 mr-2" />
            Frei
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShiftSelect("Termin")}>
            <CalendarIcon className="h-4 w-4 text-purple-500 mr-2" />
            Termin
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShiftSelect("Urlaub")}>
            <UmbrellaIcon className="h-4 w-4 text-green-500 mr-2" />
            Urlaub
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShiftSelect("Krank")}>
            <ThermometerIcon className="h-4 w-4 text-red-500 mr-2" />
            Krank
          </DropdownMenuItem>
          {shift && (
            <DropdownMenuItem onClick={() => handleShiftSelect(null)}>
              <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
              Löschen
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Termin ändern</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie diesen Termin ändern möchten?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleRemoveDialogCancel}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveDialogConfirm}>
              Ja, ändern
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ShiftCell;
