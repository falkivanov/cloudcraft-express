
import { Employee } from "@/types/employee";

/**
 * Build mapping tables from employee data for different matching approaches
 */
export function buildEmployeeMappings(employees: Employee[]) {
  const employeesByMentorId = new Map();
  const employeesByFirstLastName = new Map();
  const employeesByTransporterId = new Map();
  
  // Build mapping tables from employee data
  employees.forEach(employee => {
    // First add by transporterId for direct matching
    if (employee.transporterId) {
      employeesByTransporterId.set(employee.transporterId.toLowerCase(), {
        name: employee.name,
        transporterId: employee.transporterId
      });
    }
    
    // Add by mentor information if available
    if (employee.mentorFirstName || employee.mentorLastName) {
      // Store by mentor first name (which often contains the anonymized ID)
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
      
      // Store by mentor last name too
      if (employee.mentorLastName) {
        const mentorLastNameKey = employee.mentorLastName.trim();
        if (mentorLastNameKey.length > 0) {
          employeesByMentorId.set(mentorLastNameKey, {
            name: employee.name,
            transporterId: employee.transporterId
          });
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
      
      // Store by employee name for partial matching
      if (employee.name) {
        const [firstName, lastName] = employee.name.split(' ');
        if (firstName && lastName) {
          employeesByFirstLastName.set(`${firstName.toLowerCase()}_${lastName.toLowerCase()}`, {
            name: employee.name,
            transporterId: employee.transporterId
          });
        }
      }
    }
  });
  
  // For debugging
  console.log(`Built employee mappings:
    - By Mentor ID: ${employeesByMentorId.size} entries
    - By Employee Name: ${employeesByFirstLastName.size} entries
    - By Transporter ID: ${employeesByTransporterId.size} entries
  `);
  
  // Log a sample of the mapping to help with debugging
  if (employeesByMentorId.size > 0) {
    console.log("Sample mentor ID mappings (first 3):");
    let count = 0;
    for (const [key, value] of employeesByMentorId.entries()) {
      console.log(`  - ${key} -> ${value.name}`);
      count++;
      if (count >= 3) break;
    }
  }
  
  return {
    byMentorId: employeesByMentorId,
    byName: employeesByFirstLastName,
    byTransporterId: employeesByTransporterId
  };
}

/**
 * Try to match a driver to an employee using various strategies
 */
export function matchDriverToEmployee(driver: {firstName?: string, lastName?: string, station?: string}, mappings: ReturnType<typeof buildEmployeeMappings>) {
  const { byMentorId, byName, byTransporterId } = mappings;
  let matchedEmployee = null;
  
  console.log(`Attempting to match driver: ${driver.firstName} ${driver.lastName}`, driver);
  
  // Strategy 1: Exact match on mentor ID (firstName field in Mentor data)
  if (driver.firstName) {
    const mentorIdKey = driver.firstName.trim();
    matchedEmployee = byMentorId.get(mentorIdKey);
    console.log(`Trying match by exact ID: "${mentorIdKey}" -> ${matchedEmployee ? matchedEmployee.name : 'No match'}`);
    
    // Try with trailing equals signs removed (common in base64 encoded data)
    if (!matchedEmployee && mentorIdKey.includes('=')) {
      const cleanedKey = mentorIdKey.replace(/=+$/, '');
      matchedEmployee = byMentorId.get(cleanedKey);
      console.log(`Trying match by cleaned ID: "${cleanedKey}" -> ${matchedEmployee ? matchedEmployee.name : 'No match'}`);
      
      // If still no match, try more aggressive truncation patterns
      if (!matchedEmployee) {
        // Try removing all special characters
        const veryCleanedKey = cleanedKey.replace(/[^a-zA-Z0-9]/g, '');
        matchedEmployee = byMentorId.get(veryCleanedKey);
        console.log(`Trying match by very cleaned ID: "${veryCleanedKey}" -> ${matchedEmployee ? matchedEmployee.name : 'No match'}`);
      }
    }
  }
  
  // Strategy 2: Try matching the last name field
  if (!matchedEmployee && driver.lastName) {
    const lastNameKey = driver.lastName.trim();
    matchedEmployee = byMentorId.get(lastNameKey);
    console.log(`Trying match by last name ID: "${lastNameKey}" -> ${matchedEmployee ? matchedEmployee.name : 'No match'}`);
  }
  
  // Strategy 3: Combined first and last name match
  if (!matchedEmployee && driver.firstName && driver.lastName) {
    const combinedKey = `${driver.firstName.trim()}_${driver.lastName.trim()}`;
    matchedEmployee = byMentorId.get(combinedKey);
    console.log(`Trying match by combined key: "${combinedKey}" -> ${matchedEmployee ? matchedEmployee.name : 'No match'}`);
    
    // If no match, try with equals signs removed
    if (!matchedEmployee && combinedKey.includes('=')) {
      const cleanedKey = combinedKey.replace(/=+$/, '');
      matchedEmployee = byMentorId.get(cleanedKey);
      console.log(`Trying match by cleaned combined key: "${cleanedKey}" -> ${matchedEmployee ? matchedEmployee.name : 'No match'}`);
    }
  }
  
  // Strategy 4: Try matching by reversed transporter ID
  // Sometimes the mentorFirstName might actually be a transporterId
  if (!matchedEmployee && driver.firstName) {
    const possibleTransporterId = driver.firstName.trim().toLowerCase();
    matchedEmployee = byTransporterId.get(possibleTransporterId);
    console.log(`Trying match by possible transporter ID: "${possibleTransporterId}" -> ${matchedEmployee ? matchedEmployee.name : 'No match'}`);
  }
  
  return matchedEmployee;
}
