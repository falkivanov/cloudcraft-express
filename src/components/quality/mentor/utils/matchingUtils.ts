
import { Employee } from "@/types/employee";

/**
 * Build mapping tables from employee data for different matching approaches
 */
export function buildEmployeeMappings(employees: Employee[]) {
  const employeesByMentorId = new Map();
  
  // Build mapping tables from employee data
  employees.forEach(employee => {
    // Only process employees with mentorFirstName or mentorLastName
    if (employee.mentorFirstName || employee.mentorLastName) {
      // Store by mentor ID - this is the primary matching strategy
      if (employee.mentorFirstName) {
        const mentorIdKey = employee.mentorFirstName.trim();
        if (mentorIdKey.length > 0) {
          employeesByMentorId.set(mentorIdKey, {
            name: employee.name,
            transporterId: employee.transporterId
          });
          
          // Also try with = signs removed (common in base64 encoding)
          const cleanKey = mentorIdKey.replace(/=+$/, '');
          if (cleanKey !== mentorIdKey) {
            employeesByMentorId.set(cleanKey, {
              name: employee.name,
              transporterId: employee.transporterId
            });
          }
        }
      }
      
      // Also try combination of first and last if both exist
      if (employee.mentorFirstName && employee.mentorLastName) {
        const combinedKey = `${employee.mentorFirstName.trim()}_${employee.mentorLastName.trim()}`;
        employeesByMentorId.set(combinedKey, {
          name: employee.name,
          transporterId: employee.transporterId
        });
      }
    }
  });
  
  return employeesByMentorId;
}

/**
 * Try to match a driver to an employee using various strategies
 */
export function matchDriverToEmployee(driver: {firstName?: string, lastName?: string}, employeesByMentorId: Map<string, any>) {
  let matchedEmployee = null;
      
  // Strategy 1: Exact match on mentor ID (firstName field in Mentor data)
  if (driver.firstName) {
    const mentorIdKey = driver.firstName.trim();
    matchedEmployee = employeesByMentorId.get(mentorIdKey);
    
    // Try with trailing equals signs removed (common in base64 encoded data)
    if (!matchedEmployee && mentorIdKey.includes('=')) {
      const cleanedKey = mentorIdKey.replace(/=+$/, '');
      matchedEmployee = employeesByMentorId.get(cleanedKey);
      
      // If still no match, try more aggressive truncation patterns
      if (!matchedEmployee) {
        // Try removing all special characters
        const veryCleanedKey = cleanedKey.replace(/[^a-zA-Z0-9]/g, '');
        matchedEmployee = employeesByMentorId.get(veryCleanedKey);
      }
    }
  }
  
  // Strategy 2: Combined first and last name match
  if (!matchedEmployee && driver.firstName && driver.lastName) {
    const combinedKey = `${driver.firstName.trim()}_${driver.lastName.trim()}`;
    matchedEmployee = employeesByMentorId.get(combinedKey);
    
    // If no match, try with equals signs removed
    if (!matchedEmployee && combinedKey.includes('=')) {
      const cleanedKey = combinedKey.replace(/=+$/, '');
      matchedEmployee = employeesByMentorId.get(cleanedKey);
    }
  }
  
  return matchedEmployee;
}
