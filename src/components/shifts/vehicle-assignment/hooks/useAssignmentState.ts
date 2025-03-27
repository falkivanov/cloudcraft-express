
import { useState, useEffect } from "react";

export function useAssignmentState(tomorrowAssignments: Record<string, string>) {
  const [assignmentMap, setAssignmentMap] = useState<Record<string, string>>(tomorrowAssignments);
  
  // Update local state when tomorrowAssignments changes
  useEffect(() => {
    setAssignmentMap(tomorrowAssignments);
  }, [tomorrowAssignments]);

  const handleAssignmentChange = (vehicleId: string, employeeId: string) => {
    setAssignmentMap(prev => {
      // Handle unassignment
      if (employeeId === "none") {
        const newMap = { ...prev };
        delete newMap[vehicleId];
        return newMap;
      }
      
      // First remove if this employee is already assigned elsewhere
      const updatedMap = { ...prev };
      Object.keys(updatedMap).forEach(vId => {
        if (updatedMap[vId] === employeeId) {
          delete updatedMap[vId];
        }
      });
      
      // Now assign to the new vehicle
      return {
        ...updatedMap,
        [vehicleId]: employeeId
      };
    });
  };

  return {
    assignmentMap,
    handleAssignmentChange
  };
}
