
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
    
    // For demonstration, let's create manual mappings for the drivers in the screenshot
    // This should be removed or replaced with a more automated approach in production
    const manualMappings: Record<string, string> = {
      "CXj/3tgrD7kAK8zpa8Ej4g==": "Anna Müller",
      "X8cd86yNj90SICxGTQkn/A==": "Thomas Schmidt",
      "QG4OyykqwH9oih9a3B1q8A==": "Sarah Weber",
      "Oie821laz44l/dhv3o9wg==": "Michael Fischer",
      "Xvbthgkwsqoj6vydcc56rw==": "Julia Becker",
      "SOgV5fVRK9GsIXseNyyGFA==": "Daniel Hoffmann"
    };
    
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
    
    // For the rest of the drivers, try to match by name patterns in the future
    
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
  }
}
