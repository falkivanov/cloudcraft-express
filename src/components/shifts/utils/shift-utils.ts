
import { ShiftAssignment } from "@/types/shift";

export type ShiftType = "Arbeit" | "Frei" | "Termin" | "Urlaub" | "Krank" | null;

export const dispatchShiftEvent = (
  employeeId: string, 
  date: string, 
  shiftType: ShiftType, 
  action: 'add' | 'remove',
  previousShiftType?: ShiftType
) => {
  try {
    if (action === 'add' && shiftType) {
      const assignment: ShiftAssignment = {
        id: `${employeeId}-${date}`,
        employeeId,
        date,
        shiftType,
        confirmed: false,
        // Add missing required properties
        startTime: "08:00",  // Default start time
        endTime: "16:00",    // Default end time
        status: "assigned",  // Default status
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log(`Dispatching add shift event:`, {
        employeeId,
        date,
        shiftType,
        previousShiftType
      });
      
      document.dispatchEvent(new CustomEvent('shiftAssigned', { 
        detail: { 
          assignment,
          action: 'add'
        }
      }));
    } else if (action === 'remove') {
      console.log(`Dispatching remove shift event:`, {
        employeeId,
        date,
        previousShiftType
      });
      
      document.dispatchEvent(new CustomEvent('shiftAssigned', { 
        detail: { 
          assignment: { 
            id: `${employeeId}-${date}`,
            employeeId, 
            date,
            shiftType: previousShiftType,
            // Add missing required properties for the remove action as well
            startTime: "08:00",
            endTime: "16:00",
            status: "cancelled", // Use cancelled for removes
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          action: 'remove'
        }
      }));
    }
  } catch (error) {
    console.error(`Error dispatching ${action} shift event:`, error);
  }
};

export const dispatchClearAllShiftsEvent = () => {
  try {
    console.log("Dispatching clearAllShifts event");
    document.dispatchEvent(new CustomEvent('clearAllShifts'));
  } catch (error) {
    console.error("Error dispatching clearAllShifts event:", error);
  }
};

export const getBackgroundColorClass = (
  shift: ShiftType, 
  isPreferredDay: boolean, 
  isFlexible: boolean
): string => {
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
