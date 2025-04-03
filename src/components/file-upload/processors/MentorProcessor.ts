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

      // Additional sample data check for risk columns
      if (processedData.drivers.length > 0) {
        const sampleDriver = processedData.drivers[0];
        console.log("Detailed sample driver data (first driver) with anonymized ID:", {
          firstName: sampleDriver.firstName, // This should be the anonymized ID
          lastName: sampleDriver.lastName,
          trips: sampleDriver.totalTrips,
          hours: sampleDriver.totalHours,
          km: sampleDriver.totalKm,
          accel: sampleDriver.acceleration,
          brake: sampleDriver.braking, 
          corner: sampleDriver.cornering,
          speed: sampleDriver.speeding,
          seatbelt: sampleDriver.seatbelt
        });
      }
      
      // Update employee records with mentor IDs if not already present
      this.tryUpdateEmployeeMentorIds(processedData.drivers);
      
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
   * Try to update employee mentor IDs from the driver data
   */
  private tryUpdateEmployeeMentorIds(drivers: any[]): void {
    // Load current employees
    const employees = loadFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES) || [];
    if (employees.length === 0) {
      console.log("No employees found in storage, skipping mentor ID update");
      return;
    }

    console.log(`Attempting to update mentor IDs for ${employees.length} employees from ${drivers.length} drivers`);
    
    // For each employee, try to find a match in the mentor data
    let updatedCount = 0;
    const updatedEmployees = employees.map(employee => {
      // Skip if the employee already has mentor IDs
      if (employee.mentorFirstName && employee.mentorLastName) {
        return employee;
      }
      
      // Try to find a matching driver by name
      const matchingDriver = drivers.find(driver => {
        // If we have an employeeName in the driver data, this is ideal for matching
        if (driver.employeeName && driver.employeeName === employee.name) {
          return true;
        }
        
        // Otherwise try various fallback strategies
        // Check if driver's station matches employee station (if available)
        // Or try partial name matching
        return false; // For now, we only use direct matches
      });
      
      if (matchingDriver) {
        updatedCount++;
        console.log(`Found mentor ID match for employee ${employee.name}: ${matchingDriver.firstName}`);
        return {
          ...employee,
          mentorFirstName: matchingDriver.firstName || employee.mentorFirstName,
          mentorLastName: matchingDriver.lastName || employee.mentorLastName
        };
      }
      
      return employee;
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
  }
}
