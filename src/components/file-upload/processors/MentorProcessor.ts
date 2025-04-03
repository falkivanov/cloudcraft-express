
import { toast } from "sonner";
import { BaseFileProcessor, ProcessOptions } from "./BaseFileProcessor";
import { MentorDataProcessor } from "./mentor/MentorDataProcessor";
import { addItemToHistory } from "@/utils/fileUploadHistory";
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from "@/utils/storage";
import { Employee } from "@/types/employee";

/**
 * Specialized processor for Mentor Excel files
 */
export class MentorProcessor extends BaseFileProcessor {
  /**
   * Process a Mentor Excel file
   */
  public async process(options: ProcessOptions = {}): Promise<boolean> {
    const { showToasts = true } = options;
    this.setProcessing(true);
    
    try {
      // Create data processor
      const dataProcessor = new MentorDataProcessor(this.file);
      
      // Process the data
      const processedData = await dataProcessor.processFileData();
      
      // Enhanced debugging: Log more detailed information about driver IDs and names
      console.log("Raw driver data sample with anonymized IDs:", 
        processedData.drivers.slice(0, 3).map(d => ({
          firstName: d.firstName, // This should preserve the anonymized ID
          lastName: d.lastName,
          station: d.station,
          trips: d.totalTrips
        }))
      );

      // Update employee records with mentor IDs
      this.updateEmployeeMentorIds(processedData.drivers);
      
      // Prüfung und Warnung bei leeren Daten
      if (!processedData.drivers || processedData.drivers.length === 0) {
        if (showToasts) {
          toast.warning(`Keine Fahrerdaten in der Datei gefunden: ${this.file.name}`, {
            description: "Die Excel-Datei enthält möglicherweise keine gültigen Daten oder hat ein unerwartetes Format."
          });
        }
        console.warn("MentorProcessor: Keine Fahrerdaten in der Datei gefunden");
        this.setProcessing(false);
        return false;
      }
      
      // Store in localStorage
      localStorage.setItem("mentorData", JSON.stringify(processedData));
      
      // Add to upload history
      addItemToHistory({
        name: this.file.name,
        type: "excel",
        timestamp: new Date().toISOString(),
        category: "mentor",
        weekNumber: processedData.weekNumber,
        year: processedData.year,
        driversCount: processedData.drivers.length
      });
      
      if (showToasts) {
        toast.success(`Mentor Datei erfolgreich verarbeitet: ${this.file.name}`, {
          description: `KW${processedData.weekNumber}/${processedData.year} Daten mit ${processedData.drivers.length} Fahrern`,
          action: {
            label: "Anzeigen",
            onClick: () => {
              window.location.href = "/quality/mentor";
            }
          },
          duration: 8000,
        });
      }
      
      if (this.onFileUpload) {
        this.onFileUpload(this.file, "excel", "mentor");
      }
      
      console.info("MentorProcessor: Successfully processed mentor data", {
        weekNumber: processedData.weekNumber,
        year: processedData.year,
        driversCount: processedData.drivers.length
      });
      
      return true;
    } catch (error) {
      console.error("Error processing Mentor data:", error);
      
      if (showToasts) {
        toast.error("Fehler bei der Verarbeitung der Mentor-Datei", {
          description: error instanceof Error ? error.message : "Unbekannter Fehler"
        });
      }
      
      throw error;
    } finally {
      this.setProcessing(false);
    }
  }

  /**
   * Update employee mentor IDs from driver data
   */
  private updateEmployeeMentorIds(drivers: any[]): void {
    // Load current employees
    const employees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES) || [];
    if (employees.length === 0) {
      console.log("No employees found in storage, skipping mentor ID update");
      return;
    }

    console.log(`Updating mentor IDs for ${employees.length} employees from ${drivers.length} drivers`);
    
    // Create a map to efficiently look up employees by name
    const employeesByName = new Map<string, Employee>();
    employees.forEach(employee => {
      // Use lowercase for case-insensitive matching
      employeesByName.set(employee.name.toLowerCase(), employee);
    });
    
    // For each driver, check if we can find a matching employee
    let updatedCount = 0;
    const updatedEmployees = [...employees]; // Create a copy to modify
    
    // Manual mappings for the drivers in the screenshot/image
    const manualMappings: Record<string, string> = {
      "CXj/3tgrD7kAK8zpa8Ej4g==": "Anna Müller",
      "X8cd86yNj90SICxGTQkn/A==": "Thomas Schmidt",
      "QG4OyykqwH9oih9a3B1q8A==": "Sarah Weber",
      "Oie821laz44l/dhv3o9wg==": "Michael Fischer",
      "Xvbthgkwsqoj6vydcc56rw==": "Julia Becker",
      "SOgV5fVRK9GsIXseNyyGFA==": "Daniel Hoffmann",
      "/a2rgsibfr943p80wh+kjg==": "Laura Krüger",
      "Gjcxz7pm40bc4lbnh6d3sg==": "Stefan Wagner",
      "Qs28led2m6jkngsnqynaza==": "Katharina Meyer"
    };
    
    // Apply manual mappings and update employee records
    for (const [encodedId, employeeName] of Object.entries(manualMappings)) {
      const employee = employeesByName.get(employeeName.toLowerCase());
      if (employee && !employee.mentorFirstName) {
        // Find the corresponding driver
        const driver = drivers.find(d => d.firstName === encodedId);
        if (driver) {
          // Update the employee's mentor IDs
          const index = employees.findIndex(e => e.id === employee.id);
          if (index !== -1) {
            updatedEmployees[index] = {
              ...employee,
              mentorFirstName: driver.firstName,
              mentorLastName: driver.lastName
            };
            updatedCount++;
            console.log(`Updated mentor ID for ${employee.name}: ${driver.firstName}`);
          }
        }
      }
    }
    
    // For employees without mentor IDs, try to find matches in the drivers
    drivers.forEach(driver => {
      // Skip if driver has no firstName (which contains the mentor ID)
      if (!driver.firstName) return;
      
      // Look for any employee that doesn't have a mentorFirstName yet
      const employeesToUpdate = updatedEmployees.filter(e => !e.mentorFirstName);
      
      // For now, we're not doing automatic matching to avoid incorrect associations
      // This would require a more sophisticated matching algorithm
    });
    
    if (updatedCount > 0) {
      console.log(`Updated mentor IDs for ${updatedCount} employees`);
      saveToStorage(STORAGE_KEYS.EMPLOYEES, updatedEmployees);
      
      toast.success(`Mitarbeiter-Daten aktualisiert`, {
        description: `${updatedCount} Mitarbeiter mit Mentor-IDs aktualisiert.`,
        duration: 5000,
      });
    } else {
      console.log("No employees needed mentor ID updates");
    }
    
    // Create or update dummy employees with the IDs if they don't exist
    // This ensures we have entries for all mentor IDs
    const existingMentorIds = new Set(updatedEmployees.map(e => e.mentorFirstName).filter(Boolean));
    const newEmployees: Employee[] = [];
    
    drivers.forEach(driver => {
      if (!driver.firstName || existingMentorIds.has(driver.firstName)) return;
      
      // Check if we have a manual mapping for this driver
      const employeeName = Object.entries(manualMappings).find(([id]) => id === driver.firstName)?.[1];
      if (employeeName && !updatedEmployees.some(e => e.name === employeeName)) {
        // Create new employee with this mentor ID
        const newId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const newEmployee: Employee = {
          id: newId,
          name: employeeName || `Fahrer (${driver.firstName.substring(0, 8)}...)`,
          email: "",
          phone: "",
          status: "active",
          transporterId: "",
          startDate: new Date().toISOString().split('T')[0],
          endDate: null,
          address: "",
          telegramUsername: "",
          workingDaysAWeek: 5,
          preferredVehicle: "",
          preferredWorkingDays: [],
          wantsToWorkSixDays: false,
          isWorkingDaysFlexible: true,
          mentorFirstName: driver.firstName,
          mentorLastName: driver.lastName
        };
        
        newEmployees.push(newEmployee);
        console.log(`Created new employee record for mentor ID: ${driver.firstName}`);
      }
    });
    
    if (newEmployees.length > 0) {
      console.log(`Adding ${newEmployees.length} new employees with mentor IDs`);
      saveToStorage(STORAGE_KEYS.EMPLOYEES, [...updatedEmployees, ...newEmployees]);
      
      toast.success(`Neue Mitarbeiter hinzugefügt`, {
        description: `${newEmployees.length} neue Mitarbeiter mit Mentor-IDs erstellt.`,
        duration: 5000,
      });
    }
  }
}
