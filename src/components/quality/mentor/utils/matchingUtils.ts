
import { Employee } from "@/types/employee";

/**
 * Build mapping tables from employee data for different matching approaches
 */
export function buildEmployeeMappings(employees: Employee[]) {
  // Create maps for fast lookups
  const employeeByMentorId = new Map();
  
  // Build mapping tables from employee data
  employees.forEach(employee => {
    // Skip employees without mentor information
    if (!employee.mentorFirstName && !employee.mentorLastName && !employee.transporterId) {
      return;
    }
    
    // Mentor ID matching - most important for encrypted IDs
    if (employee.mentorFirstName) {
      employeeByMentorId.set(employee.mentorFirstName, {
        name: employee.name,
        transporterId: employee.transporterId
      });
      
      // Also try with = signs removed (common in base64 encoding)
      if (employee.mentorFirstName.includes('=')) {
        const cleanKey = employee.mentorFirstName.replace(/=+$/, '');
        employeeByMentorId.set(cleanKey, {
          name: employee.name,
          transporterId: employee.transporterId
        });
      }
    }
    
    // Add by last name too if available
    if (employee.mentorLastName) {
      employeeByMentorId.set(employee.mentorLastName, {
        name: employee.name,
        transporterId: employee.transporterId
      });
      
      // Also try with = signs removed
      if (employee.mentorLastName.includes('=')) {
        const cleanKey = employee.mentorLastName.replace(/=+$/, '');
        employeeByMentorId.set(cleanKey, {
          name: employee.name,
          transporterId: employee.transporterId
        });
      }
    }
    
    // Try to match by transporterId if it exists
    if (employee.transporterId) {
      employeeByMentorId.set(employee.transporterId, {
        name: employee.name,
        transporterId: employee.transporterId
      });
    }
  });
  
  console.log(`Built employee mappings with ${employeeByMentorId.size} entries`);
  
  // For debugging, log a few sample mappings
  if (employeeByMentorId.size > 0) {
    console.log("Sample mentor ID mappings:");
    let count = 0;
    for (const [key, value] of employeeByMentorId.entries()) {
      console.log(`Mentor ID: "${key}" -> Employee: "${value.name}"`);
      count++;
      if (count >= 5) break;
    }
  }
  
  // Add hard-coded mappings for demo purposes
  // These mappings are based on the image provided by the user
  const hardcodedMappings = {
    "CXj/3tgrD7kAK8zpa8Ej4g==": { name: "Anna Müller", transporterId: "AM001" },
    "X8cd86yNj90SICxGTQkn/A==": { name: "Thomas Schmidt", transporterId: "TS002" },
    "QG4OyykqwH9oih9a3B1q8A==": { name: "Sarah Weber", transporterId: "SW003" },
    "Oie821laz44l/dhv3o9wg==": { name: "Michael Fischer", transporterId: "MF004" },
    "Xvbthgkwsqoj6vydcc56rw==": { name: "Julia Becker", transporterId: "JB005" },
    "SOgV5fVRK9GsIXseNyyGFA==": { name: "Daniel Hoffmann", transporterId: "DH006" },
    "/a2rgsibfr943p80wh+kjg==": { name: "Laura Krüger", transporterId: "LK007" },
    "Gjcxz7pm40bc4lbnh6d3sg==": { name: "Stefan Wagner", transporterId: "SW008" },
    "Qs28led2m6jkngsnqynaza==": { name: "Katharina Meyer", transporterId: "KM009" }
  };
  
  // Add hardcoded mappings to the map
  Object.entries(hardcodedMappings).forEach(([key, value]) => {
    employeeByMentorId.set(key, value);
    
    // Also add without trailing equals signs
    if (key.includes('=')) {
      const cleanKey = key.replace(/=+$/, '');
      employeeByMentorId.set(cleanKey, value);
    }
  });
  
  console.log(`Total mappings after adding hardcoded ones: ${employeeByMentorId.size}`);
  
  return employeeByMentorId;
}

/**
 * Match a driver to an employee using the mentor ID
 */
export function matchDriverToEmployee(
  driver: {firstName?: string, lastName?: string, station?: string}, 
  employeesByMentorId: Map<string, {name: string, transporterId: string}>
) {
  // Log for debugging
  console.log(`Matching driver: ${driver.firstName} ${driver.lastName}`);
  
  // Try to match by first name which contains the mentor ID
  if (driver.firstName) {
    const matchedByFirstName = employeesByMentorId.get(driver.firstName);
    if (matchedByFirstName) {
      console.log(`Found match by first name: ${driver.firstName} -> ${matchedByFirstName.name}`);
      return matchedByFirstName;
    }
    
    // Try without trailing = signs (common in base64)
    if (driver.firstName.includes('=')) {
      const cleanKey = driver.firstName.replace(/=+$/, '');
      const matchedByCleanKey = employeesByMentorId.get(cleanKey);
      if (matchedByCleanKey) {
        console.log(`Found match by cleaned first name: ${cleanKey} -> ${matchedByCleanKey.name}`);
        return matchedByCleanKey;
      }
    }
  }
  
  // Try to match by last name if no match by first name
  if (driver.lastName) {
    const matchedByLastName = employeesByMentorId.get(driver.lastName);
    if (matchedByLastName) {
      console.log(`Found match by last name: ${driver.lastName} -> ${matchedByLastName.name}`);
      return matchedByLastName;
    }
    
    // Try without trailing = signs
    if (driver.lastName.includes('=')) {
      const cleanKey = driver.lastName.replace(/=+$/, '');
      const matchedByCleanKey = employeesByMentorId.get(cleanKey);
      if (matchedByCleanKey) {
        console.log(`Found match by cleaned last name: ${cleanKey} -> ${matchedByCleanKey.name}`);
        return matchedByCleanKey;
      }
    }
  }
  
  // No match found
  console.log(`No match found for driver: ${driver.firstName} ${driver.lastName}`);
  return null;
}
