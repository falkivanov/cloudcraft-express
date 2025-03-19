
// Check if automatic planning is possible (all days have forecast values)
export const canAutoPlan = (requiredEmployees: Record<number, number>, dayCount: number): boolean => {
  // Now we can auto-plan even if forecast isn't set
  return true;
};
