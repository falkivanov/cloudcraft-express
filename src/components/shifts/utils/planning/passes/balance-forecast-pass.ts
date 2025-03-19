
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../types";
import { getDayAbbreviation } from "../date-utils";
import { hasSpecialShift } from "../shift-status";
import { canEmployeeWorkOnDay } from "../employee-availability";

// Versucht, die Mitarbeiterverteilung so anzupassen, dass der Forecast besser erreicht wird
export function runBalanceForecastPass(
  sortedEmployees: Employee[],
  weekDays: Date[],
  filledPositions: Record<number, number>,
  employeeAssignments: Record<string, number>,
  requiredEmployees: Record<number, number>,
  formatDateKey: (date: Date) => string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  assignedWorkDays: Map<string, Set<string>>,
  existingShifts?: Map<string, ShiftAssignment>,
  workShifts?: ShiftPlan[],
  freeShifts?: ShiftPlan[]
) {
  // Identifiziere überfüllte und unterfüllte Tage
  const overfilledDays: number[] = [];
  const underfilledDays: number[] = [];
  
  weekDays.forEach((_, dayIndex) => {
    const required = requiredEmployees[dayIndex] || 0;
    const filled = filledPositions[dayIndex];
    
    if (filled > required && required > 0) {
      overfilledDays.push(dayIndex);
    } else if (filled < required) {
      underfilledDays.push(dayIndex);
    }
  });
  
  // Wenn wir keine Balance-Probleme haben, beenden wir früh
  if (underfilledDays.length === 0 || overfilledDays.length === 0) {
    return;
  }
  
  // Versuche, Mitarbeiter von überfüllten zu unterfüllten Tagen zu verschieben
  for (const overfilledDayIndex of overfilledDays) {
    for (const underfilledDayIndex of underfilledDays) {
      // Prüfe, ob wir bereits das Ziel für diesen unterfüllten Tag erreicht haben
      if (filledPositions[underfilledDayIndex] >= (requiredEmployees[underfilledDayIndex] || 0)) {
        continue;
      }
      
      const overfilledDay = weekDays[overfilledDayIndex];
      const underfilledDay = weekDays[underfilledDayIndex];
      const overfilledDateKey = formatDateKey(overfilledDay);
      const underfilledDateKey = formatDateKey(underfilledDay);
      
      const overfilledEmployees = Array.from(assignedWorkDays.get(overfilledDateKey) || []);
      
      // Suche nach Mitarbeitern, die am überfüllten Tag arbeiten, aber auch am unterfüllten Tag arbeiten könnten
      for (const employeeId of overfilledEmployees) {
        const employee = sortedEmployees.find(e => e.id === employeeId);
        if (!employee) continue;
        
        // Überprüfe, ob der Mitarbeiter am unterfüllten Tag verfügbar ist
        if (canEmployeeWorkOnDay(employee, underfilledDay, isTemporarilyFlexible)) {
          // Überprüfe, ob der Mitarbeiter bereits am unterfüllten Tag arbeitet
          const isAlreadyAssignedToUnderfilledDay = assignedWorkDays.get(underfilledDateKey)?.has(employeeId);
          if (isAlreadyAssignedToUnderfilledDay) continue;
          
          // Überprüfe auf spezielle Schichten
          const hasSpecialShiftOnUnderfilledDay = hasSpecialShift(employeeId, underfilledDateKey, existingShifts);
          if (hasSpecialShiftOnUnderfilledDay) continue;
          
          // Finde den Eintrag in workShifts für den überfüllten Tag
          const workShiftIndex = workShifts.findIndex(
            shift => shift.employeeId === employeeId && shift.date === overfilledDateKey && shift.shiftType === "Arbeit"
          );
          
          if (workShiftIndex !== -1) {
            // Entferne den Mitarbeiter vom überfüllten Tag
            workShifts.splice(workShiftIndex, 1);
            
            // Füge einen "Frei" Eintrag für den überfüllten Tag hinzu
            freeShifts.push({
              employeeId,
              date: overfilledDateKey,
              shiftType: "Frei"
            });
            
            // Entferne den Mitarbeiter aus der Liste der zugewiesenen Mitarbeiter für den überfüllten Tag
            const overfilledDayEmployees = assignedWorkDays.get(overfilledDateKey);
            if (overfilledDayEmployees) {
              overfilledDayEmployees.delete(employeeId);
            }
            
            // Aktualisiere den Counter für den überfüllten Tag
            filledPositions[overfilledDayIndex]--;
            
            // Füge den Mitarbeiter zum unterfüllten Tag hinzu
            workShifts.push({
              employeeId,
              date: underfilledDateKey,
              shiftType: "Arbeit"
            });
            
            // Füge den Mitarbeiter zur Liste der zugewiesenen Mitarbeiter für den unterfüllten Tag hinzu
            const underfilledDayEmployees = assignedWorkDays.get(underfilledDateKey);
            if (underfilledDayEmployees) {
              underfilledDayEmployees.add(employeeId);
            }
            
            // Aktualisiere den Counter für den unterfüllten Tag
            filledPositions[underfilledDayIndex]++;
            
            // Breche die Suche ab, wenn wir das Ziel für diesen unterfüllten Tag erreicht haben
            if (filledPositions[underfilledDayIndex] >= (requiredEmployees[underfilledDayIndex] || 0)) {
              break;
            }
          }
        }
      }
    }
  }
}
