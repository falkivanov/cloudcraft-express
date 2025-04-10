
import { BaseFileProcessor, ProcessOptions } from "./BaseFileProcessor";
import { toast } from "sonner";
import { parseScorecardPDF } from "@/components/quality/scorecard/utils/pdfParser";
import { STORAGE_KEYS, addItemToHistory, saveToStorage } from "@/utils/storage";
import { extractWeekFromFilename } from "@/components/quality/scorecard/utils/parser/weekUtils";

/**
 * Process scorecard PDF files
 */
export class ScorecardProcessor extends BaseFileProcessor {
  /**
   * Process a scorecard PDF file with improved extraction and error handling
   */
  public async process(options: ProcessOptions = {}): Promise<boolean> {
    const { showToasts = true } = options;
    this.setProcessing(true);
    
    console.info(`Processing scorecard file: ${this.file.name}`);
    
    try {
      // Clear existing data before processing new file
      this.clearExistingScorecardData();
      
      // Read file as ArrayBuffer for PDF.js processing
      const arrayBuffer = await this.file.arrayBuffer();
      
      console.log("Starting enhanced PDF parsing...");
      // Process the PDF file with detailed logging enabled
      const scorecardData = await parseScorecardPDF(arrayBuffer, this.file.name, true);
      
      if (scorecardData) {
        console.log("Successfully extracted scorecard data:", scorecardData);
        console.log(`Extracted ${scorecardData.driverKPIs?.length || 0} driver KPIs`);
        
        // Validate the extracted data has the minimum required fields
        if (!this.validateScorecardData(scorecardData)) {
          if (showToasts) {
            toast.warning(
              "Unvollständige Daten",
              {
                description: "Die Scorecard-Daten sind unvollständig. Einige Informationen werden mit Beispieldaten ergänzt.",
              }
            );
          }
          
          // If we didn't extract enough driver KPIs, mark it as sample data
          if (!scorecardData.driverKPIs || scorecardData.driverKPIs.length <= 1) {
            scorecardData.isSampleData = true;
          }
        }
        
        // Check if the data looks like real extraction or is potentially sample data
        if (this.isSuspectedSampleData(scorecardData)) {
          console.warn("Data appears to be sample data based on driver IDs or patterns");
          scorecardData.isSampleData = true;
          
          if (showToasts) {
            toast.warning(
              "Mögliche Beispieldaten",
              {
                description: "Die extrahierten Daten könnten Beispieldaten sein. Die PDF-Struktur wurde möglicherweise nicht korrekt erkannt.",
              }
            );
          }
        } else {
          // Mark as real data
          scorecardData.isSampleData = false;
          console.log("Data appears to be genuinely extracted from PDF");
        }
        
        // If categorizedKPIs is missing, create it from the companyKPIs
        if (!scorecardData.categorizedKPIs && Array.isArray(scorecardData.companyKPIs)) {
          scorecardData.categorizedKPIs = {
            safety: scorecardData.companyKPIs.filter(kpi => kpi.category === "safety"),
            compliance: scorecardData.companyKPIs.filter(kpi => kpi.category === "compliance"),
            customer: scorecardData.companyKPIs.filter(kpi => kpi.category === "customer"),
            standardWork: scorecardData.companyKPIs.filter(kpi => kpi.category === "standardWork"),
            quality: scorecardData.companyKPIs.filter(kpi => kpi.category === "quality"),
            capacity: scorecardData.companyKPIs.filter(kpi => kpi.category === "capacity")
          };
        }
        
        // Make sure week and year are correctly set based on filename
        const extractedWeek = extractWeekFromFilename(this.file.name);
        if (extractedWeek > 0) {
          console.log(`Setting week number to ${extractedWeek} based on filename`);
          scorecardData.week = extractedWeek;
          
          // If year is missing, use current year
          if (!scorecardData.year) {
            scorecardData.year = new Date().getFullYear();
          }
        }
        
        // Store the extracted data in localStorage - IMPORTANT: store as current scorecard
        saveToStorage(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA, scorecardData);
        localStorage.setItem("extractedScorecardData", JSON.stringify(scorecardData));
        
        // STORE WEEK-SPECIFIC DATA to preserve all uploaded weeks
        const weekKey = `scorecard_data_week_${scorecardData.week}_${scorecardData.year}`;
        saveToStorage(weekKey, scorecardData);
        console.log(`Saved week-specific data with key: ${weekKey}`);
        
        // Also store week information separately for easier access
        if (scorecardData.week && scorecardData.year) {
          localStorage.setItem("scorecard_week", String(scorecardData.week));
          localStorage.setItem("scorecard_year", String(scorecardData.year));
        }
        
        if (showToasts) {
          toast.success(
            `Scorecard für KW ${scorecardData.week}/${scorecardData.year} verarbeitet`,
            {
              description: `${scorecardData.companyKPIs.length} KPIs und ${scorecardData.driverKPIs.length} Fahrer wurden extrahiert.${scorecardData.isSampleData ? " (Beispieldaten)" : ""}`,
            }
          );
        }

        // Add to file upload history with extracted data information
        this.addToUploadHistory(this.file, "pdf", "scorecard", {
          week: scorecardData.week,
          year: scorecardData.year,
          location: scorecardData.location,
          kpiCount: scorecardData.companyKPIs.length,
          driverCount: scorecardData.driverKPIs.length,
          isReal: !scorecardData.isSampleData // Flag to indicate if data was actually extracted
        });
        
        // Dispatch a custom event to notify that scorecard data has been updated
        // This helps with updating the UI when data changes within the same window
        window.dispatchEvent(new Event('scorecardDataUpdated'));
        
        return true;
      } else {
        throw new Error("Keine Daten konnten aus der PDF-Datei extrahiert werden.");
      }
    } catch (error) {
      console.error("Error processing scorecard:", error);
      if (showToasts) {
        toast.error(
          "Fehler bei der Verarbeitung der Scorecard",
          {
            description: error instanceof Error ? error.message : "Unbekannter Fehler",
          }
        );
      }
      throw error;
    } finally {
      this.setProcessing(false);
    }
  }
  
  /**
   * Check if data appears to be sample data based on patterns
   */
  private isSuspectedSampleData(data: any): boolean {
    // No drivers or very few drivers
    if (!data.driverKPIs || data.driverKPIs.length < 3) {
      return true;
    }
    
    // Check for known sample driver IDs
    const hasSampleIds = data.driverKPIs.some((driver: any) => 
      ["TR-001", "TR-002", "TR-003", "SAMPLE"].some(id => 
        driver.name.includes(id)
      )
    );
    
    if (hasSampleIds) {
      return true;
    }
    
    // Check for unusually perfect metrics (often a sign of sample data)
    const hasTooManyPerfectMetrics = data.driverKPIs.filter((driver: any) => 
      driver.metrics && driver.metrics.some((metric: any) => 
        metric.value === 100 && ["DCR", "POD", "CC", "DEX"].includes(metric.name)
      )
    ).length > data.driverKPIs.length * 0.7; // If >70% have perfect metrics
    
    return hasTooManyPerfectMetrics;
  }
  
  /**
   * Clear existing scorecard data from localStorage
   * (only clear the current view data, not the week-specific data)
   */
  private clearExistingScorecardData(): void {
    localStorage.removeItem("scorecard_week");
    localStorage.removeItem("scorecard_year");
    localStorage.removeItem("scorecard_data");
    localStorage.removeItem("scorecardData");
    localStorage.removeItem(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA);
    localStorage.removeItem("extractedScorecardData");
    console.log("Cleared existing scorecard data from localStorage");
  }
  
  /**
   * Validate that the scorecard data has the minimum required fields
   */
  private validateScorecardData(data: any): boolean {
    if (!data) return false;
    
    // Check for essential properties
    if (!data.week || !data.year) {
      console.warn("Missing week or year in scorecard data");
      return false;
    }
    
    // Check for company KPIs
    if (!Array.isArray(data.companyKPIs) || data.companyKPIs.length < 5) {
      console.warn("Missing or insufficient company KPIs in scorecard data");
      return false;
    }
    
    // Check for driver KPIs
    if (!Array.isArray(data.driverKPIs) || data.driverKPIs.length === 0) {
      console.warn("Missing driver KPIs in scorecard data");
      return false;
    }
    
    return true;
  }
  
  /**
   * Add file upload to history with additional metadata
   */
  protected addToUploadHistory(file: File, type: string, category: string, metadata: any = {}): void {
    const historyItem = {
      name: file.name,
      type: type,
      timestamp: new Date().toISOString(),
      category: category,
      ...metadata
    };
    
    addItemToHistory(historyItem);
  }
}
