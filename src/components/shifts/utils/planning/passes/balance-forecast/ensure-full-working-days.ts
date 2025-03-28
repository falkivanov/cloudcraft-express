
import { Employee } from "@/types/employee";
import { ShiftAssignment } from "@/types/shift";
import { ShiftPlan } from "../../types";
import { hasSpecialShift } from "../../shift-status";
import { canEmployeeWorkOnDay } from "../../employee-availability";

// Helper function to ensure all employees are assigned their full working days
export function ensureFullWorkingDays(
  sortedEmployees: Employee[],
  weekDays: Date[],
  filledPositions: Record<number, number>,
  requiredEmployees: Record<number, number>,
  assignedWorkDays: Map<string, Set<string>>,
  formatDateKey: (date: Date) => string,
  isTemporarilyFlexible: (employeeId: string) => boolean,
  employeeAssignments: Record<string, number>,
  existingShifts?: Map<string, ShiftAssignment>,
  workShifts?: ShiftPlan[],
  freeShifts?: ShiftPlan[]
) {
  console.log("Starting ensure-full-working-days pass");
  
  // First, check if we have a global shortage (total required > total possible shifts)
  let totalRequired = 0;
  let totalFilled = 0;
  let totalShortage = 0;
  
  weekDays.forEach((day, dayIndex) => {
    const required = requiredEmployees[dayIndex] || 0;
    const filled = filledPositions[dayIndex];
    totalRequired += required;
    totalFilled += filled;
    
    if (filled < required) {
      totalShortage += (required - filled);
    }
  });
  
  // Determine if we need to assign 6th days or not
  const needsExtraDays = totalShortage > 0;
  console.log(`Total shortage: ${totalShortage}, needs extra days: ${needsExtraDays}`);
  
  // First pass: find employees who aren't assigned their full working days yet
  const underutilizedEmployees = sortedEmployees
    .filter(employee => {
      const assignedDays = employeeAssignments[employee.id] || 0;
      return assignedDays < employee.workingDaysAWeek;
    })
    .sort((a, b) => {
      // Prioritize employees with the biggest gap between assigned and target days
      const aGap = a.workingDaysAWeek - (employeeAssignments[a.id] || 0);
      const bGap = b.workingDaysAWeek - (employeeAssignments[b.id] || 0);
      return bGap - aGap;
    });
  
  console.log(`Found ${underutilizedEmployees.length} employees not assigned their full days`);
  
  // First, prioritize days that are still underfilled
  const underfilledDays: { dayIndex: number, dateKey: string, day: Date }[] = [];
  
  weekDays.forEach((day, dayIndex) => {
    const required = requiredEmployees[dayIndex] || 0;
    const filled = filledPositions[dayIndex];
    const dateKey = formatDateKey(day);
    
    if (filled < required) {
      underfilledDays.push({ dayIndex, dateKey, day });
    }
  });
  
  // Sort underfilled days by most understaffed first (largest gap between required and filled)
  underfilledDays.sort((a, b) => {
    const aGap = (requiredEmployees[a.dayIndex] || 0) - filledPositions[a.dayIndex];
    const bGap = (requiredEmployees[b.dayIndex] || 0) - filledPositions[b.dayIndex];
    return bGap - aGap;
  });
  
  // Process each underutilized employee (who isn't assigned their full working days)
  for (const employee of underutilizedEmployees) {
    const assignedDays = employeeAssignments[employee.id] || 0;
    const targetDays = employee.workingDaysAWeek;
    const daysNeeded = targetDays - assignedDays;
    
    if (daysNeeded <= 0) continue;
    
    console.log(`Employee ${employee.name} needs ${daysNeeded} more days (current: ${assignedDays}, target: ${targetDays})`);
    
    // Special case for employees who want to work 6 days but are set to 5
    // Only consider this if we truly need extra days
    const shouldConsiderExtraDay = employee.workingDaysAWeek === 5 && 
                                   employee.wantsToWorkSixDays && 
                                   needsExtraDays;
    
    const actualTargetDays = shouldConsiderExtraDay ? 6 : targetDays;
    
    // First try to assign to underfilled days
    let remainingDaysToAssign = actualTargetDays - assignedDays;
    let daysAssigned = 0;
    
    // First pass: focus on underfilled days
    if (remainingDaysToAssign > 0 && underfilledDays.length > 0) {
      for (const { dayIndex, dateKey, day } of underfilledDays) {
        // Skip if already assigned to this day
        if (assignedWorkDays.get(dateKey)?.has(employee.id)) continue;
        
        // Skip if has special shift
        if (hasSpecialShift(employee.id, dateKey, existingShifts)) continue;
        
        // Check if employee can work on this day
        if (canEmployeeWorkOnDay(employee, day, isTemporarilyFlexible)) {
          // Assign to this day
          workShifts.push({
            employeeId: employee.id,
            date: dateKey,
            shiftType: "Arbeit"
          });
          
          // Remove any "Frei" shifts for this employee on this day
          const freeShiftIndex = freeShifts.findIndex(
            shift => shift.employeeId === employee.id && shift.date === dateKey
          );
          
          if (freeShiftIndex !== -1) {
            freeShifts.splice(freeShiftIndex, 1);
          }
          
          // Update tracking
          employeeAssignments[employee.id] = (employeeAssignments[employee.id] || 0) + 1;
          filledPositions[dayIndex]++;
          
          // Add to assigned employees for this day
          const dayEmployees = assignedWorkDays.get(dateKey);
          if (dayEmployees) {
            dayEmployees.add(employee.id);
          }
          
          daysAssigned++;
          remainingDaysToAssign--;
          
          console.log(`Assigned ${employee.name} to underfilled day ${dayIndex}`);
          
          // Stop if fully assigned or this day is now filled
          if (remainingDaysToAssign <= 0 || filledPositions[dayIndex] >= (requiredEmployees[dayIndex] || 0)) {
            break;
          }
        }
      }
    }
    
    // Second pass: if still not fully assigned, try all days with a preference for the least overstaffed
    if (remainingDaysToAssign > 0) {
      // Get all days where the employee is not yet assigned, sorted by staffing level (least overstaffed first)
      const availableDays = weekDays
        .map((day, index) => ({ day, index, dateKey: formatDateKey(day) }))
        .filter(({ dateKey }) => !assignedWorkDays.get(dateKey)?.has(employee.id))
        .filter(({ dateKey }) => !hasSpecialShift(employee.id, dateKey, existingShifts))
        .sort((a, b) => {
          const aRequired = requiredEmployees[a.index] || 0;
          const bRequired = requiredEmployees[b.index] || 0;
          
          // Compare overstaffing ratios (filled / required)
          const aRatio = aRequired === 0 ? Infinity : filledPositions[a.index] / aRequired;
          const bRatio = bRequired === 0 ? Infinity : filledPositions[b.index] / bRequired;
          
          return aRatio - bRatio; // Lower ratio (less overstaffed) comes first
        });
      
      for (const { day, index, dateKey } of availableDays) {
        // Skip if already assigned
        if (assignedWorkDays.get(dateKey)?.has(employee.id)) continue;
        
        // Check if employee can work on this day
        if (canEmployeeWorkOnDay(employee, day, isTemporarilyFlexible)) {
          // Assign to this day
          workShifts.push({
            employeeId: employee.id,
            date: dateKey,
            shiftType: "Arbeit"
          });
          
          // Remove any "Frei" shifts for this employee on this day
          const freeShiftIndex = freeShifts.findIndex(
            shift => shift.employeeId === employee.id && shift.date === dateKey
          );
          
          if (freeShiftIndex !== -1) {
            freeShifts.splice(freeShiftIndex, 1);
          }
          
          // Update tracking
          employeeAssignments[employee.id] = (employeeAssignments[employee.id] || 0) + 1;
          filledPositions[index]++;
          
          // Add to assigned employees for this day
          const dayEmployees = assignedWorkDays.get(dateKey);
          if (dayEmployees) {
            dayEmployees.add(employee.id);
          }
          
          daysAssigned++;
          remainingDaysToAssign--;
          
          console.log(`Assigned ${employee.name} to day ${index} (still needs: ${remainingDaysToAssign})`);
          
          // Stop if fully assigned
          if (remainingDaysToAssign <= 0) {
            break;
          }
        }
      }
    }
    
    // Log if we couldn't fully assign this employee
    if (daysAssigned < daysNeeded) {
      console.log(`Could only assign ${daysAssigned}/${daysNeeded} additional days to ${employee.name}`);
    }
  }
  
  // Check if we need to enforce 5 days for employees who should work 5 days
  // This may involve removing employees from overstaffed days and adding them to understaffed days
  const fullTimeEmployees = sortedEmployees.filter(e => e.workingDaysAWeek >= 5);
  console.log(`Checking ${fullTimeEmployees.length} full-time employees for enforcing 5-day schedules`);
  
  for (const employee of fullTimeEmployees) {
    const assignedDays = employeeAssignments[employee.id] || 0;
    
    // Skip if already assigned enough days
    if (assignedDays >= employee.workingDaysAWeek) continue;
    
    console.log(`Full-time employee ${employee.name} is under-scheduled (${assignedDays}/${employee.workingDaysAWeek} days)`);
    
    // For each day, check if employee is free and can be assigned to work
    for (let dayIndex = 0; dayIndex < weekDays.length; dayIndex++) {
      const day = weekDays[dayIndex];
      const dateKey = formatDateKey(day);
      
      // Skip if already assigned to this day
      if (assignedWorkDays.get(dateKey)?.has(employee.id)) continue;
      
      // Skip if has special shift
      if (hasSpecialShift(employee.id, dateKey, existingShifts)) continue;
      
      // Check if this employee has "Frei" on this day (we can convert to "Arbeit")
      const hasFreeShift = freeShifts.some(
        shift => shift.employeeId === employee.id && shift.date === dateKey
      );
      
      // Check if employee can work on this day
      if (hasFreeShift && canEmployeeWorkOnDay(employee, day, isTemporarilyFlexible)) {
        // Remove the "Frei" shift
        const freeShiftIndex = freeShifts.findIndex(
          shift => shift.employeeId === employee.id && shift.date === dateKey
        );
        
        if (freeShiftIndex !== -1) {
          freeShifts.splice(freeShiftIndex, 1);
        }
        
        // Add work shift
        workShifts.push({
          employeeId: employee.id,
          date: dateKey,
          shiftType: "Arbeit"
        });
        
        // Update tracking
        employeeAssignments[employee.id] = (employeeAssignments[employee.id] || 0) + 1;
        filledPositions[dayIndex]++;
        
        // Add to assigned employees for this day
        const dayEmployees = assignedWorkDays.get(dateKey);
        if (dayEmployees) {
          dayEmployees.add(employee.id);
        }
        
        console.log(`Converted ${employee.name}'s "Frei" to "Arbeit" on day ${dayIndex}`);
        
        // Stop if fully assigned
        if (employeeAssignments[employee.id] >= employee.workingDaysAWeek) {
          break;
        }
      }
    }
  }
}
