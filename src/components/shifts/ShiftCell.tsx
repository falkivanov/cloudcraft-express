
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ShiftType, dispatchShiftEvent, getBackgroundColorClass } from "./utils/shift-utils";
import UnavailableCell from "./UnavailableCell";
import ShiftSelectionMenu from "./ShiftSelectionMenu";
import ShiftRemoveDialog from "./ShiftRemoveDialog";

interface ShiftCellProps {
  employeeId: string;
  date: string;
  preferredDays: string[];
  dayOfWeek: string;
  isFlexible?: boolean;
}

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
    
    // Create and dispatch events for shifts
    const action = shiftType ? 'add' : 'remove';
    dispatchShiftEvent(employeeId, date, shiftType, action);
  };
  
  const handleRemoveDialogConfirm = () => {
    // Close dialog first before making any changes
    setShowRemoveDialog(false);
    
    // Update the shift state
    setShift(pendingShiftChange);
    
    // Create and dispatch the event for a confirmed Termin change
    const action = pendingShiftChange ? 'add' : 'remove';
    dispatchShiftEvent(employeeId, date, pendingShiftChange, action);
    
    // Reset pending shift change
    setPendingShiftChange(null);
  };
  
  const handleRemoveDialogCancel = () => {
    setShowRemoveDialog(false);
    setPendingShiftChange(null);
  };
  
  // If employee is not flexible and this day is not preferred, show unavailable cell
  if (!isFlexible && !isPreferredDay) {
    return <UnavailableCell />;
  }
  
  const backgroundColorClass = getBackgroundColorClass(shift, isPreferredDay, isFlexible);
  
  return (
    <>
      <ShiftSelectionMenu
        shift={shift}
        isLoading={isLoading}
        backgroundColorClass={backgroundColorClass}
        onShiftSelect={handleShiftSelect}
      />

      <ShiftRemoveDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        onConfirm={handleRemoveDialogConfirm}
        onCancel={handleRemoveDialogCancel}
      />
    </>
  );
};

export default ShiftCell;
