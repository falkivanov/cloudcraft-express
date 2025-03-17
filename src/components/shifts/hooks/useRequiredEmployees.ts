
import { useState, useCallback } from "react";

export const useRequiredEmployees = () => {
  // Track required employees for each day (Mon-Sat)
  const [requiredEmployees, setRequiredEmployees] = useState<Record<number, number>>({
    0: 0, // Monday
    1: 0, // Tuesday
    2: 0, // Wednesday
    3: 0, // Thursday
    4: 0, // Friday
    5: 0, // Saturday
  });
  
  const handleRequiredChange = useCallback((dayIndex: number, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    setRequiredEmployees(prev => ({
      ...prev,
      [dayIndex]: numValue
    }));
  }, []);
  
  return {
    requiredEmployees,
    handleRequiredChange
  };
};
