
import { toast } from "sonner";
import { BaseFileProcessor, ProcessOptions } from "./BaseFileProcessor";
import { MentorDataProcessor } from "./mentor/MentorDataProcessor";
import { addItemToHistory } from "@/utils/fileUploadHistory";

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
}
