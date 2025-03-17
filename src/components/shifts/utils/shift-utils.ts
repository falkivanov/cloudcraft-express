
import { ShiftAssignment } from "@/types/shift";

export type ShiftType = "Arbeit" | "Frei" | "Termin" | "Urlaub" | "Krank" | null;

export const dispatchShiftEvent = (
  employeeId: string, 
  date: string, 
  shiftType: ShiftType, 
  action: 'add' | 'remove'
) => {
  try {
    if (action === 'add' && shiftType) {
      const assignment: ShiftAssignment = {
        id: `${employeeId}-${date}`,
        employeeId,
        date,
        shiftType,
        confirmed: false
      };
      
      document.dispatchEvent(new CustomEvent('shiftAssigned', { 
        detail: { 
          assignment,
          action: 'add',
          countAsScheduled: shiftType === "Arbeit"
        }
      }));
    } else if (action === 'remove') {
      // For remove actions, we need to pass relevant info about what was removed
      document.dispatchEvent(new CustomEvent('shiftAssigned', { 
        detail: { 
          // Send the complete assignment ID format that matches what we use for adding
          assignment: { 
            id: `${employeeId}-${date}`,
            employeeId, 
            date,
            // Important: include the previous shift type if we're trying to track what was removed
            shiftType: null 
          },
          action: 'remove',
          // This indicates whether it should affect the scheduled count
          countAsScheduled: false
        }
      }));
    }
  } catch (error) {
    console.error(`Error dispatching ${action} shift event:`, error);
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
