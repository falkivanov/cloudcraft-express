
import { toast } from "sonner";
import { BaseFileProcessor, ProcessOptions } from "./BaseFileProcessor";
import * as XLSX from "xlsx";
import { ConcessionItem, ConcessionsData } from "@/components/quality/concessions/types";
import { findRequiredColumns, validateRequiredColumns } from "./concessions/columnDetection";
import { determineCurrentWeek, extractWeeksFromData } from "./concessions/weekUtils";
import { extractConcessionItems, getSortedAvailableWeeks } from "./concessions/dataExtraction";
import { readFileAsArrayBuffer } from "./concessions/fileUtils";

/**
 * Specialized processor for Concessions Excel files
 */
export class ConcessionsProcessor extends BaseFileProcessor {
  /**
   * Process a Concessions Excel file
   */
  public async process(options: ProcessOptions = {}): Promise<boolean> {
    const { showToasts = true } = options;
    this.setProcessing(true);
    
    try {
      const arrayBuffer = await readFileAsArrayBuffer(this.file);
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      
      // Check if DNR Concessions sheet exists
      let sheetName = this.findAppropriateSheet(workbook);
      const sheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });
      
      if (rawData.length <= 1) {
        if (showToasts) {
          toast.error("Keine Daten in der Excel-Datei gefunden", {
            description: "Die Datei enthält keine verarbeitbaren Daten."
          });
        }
        return false;
      }
      
      // Extract header row and find column indices with flexible matching
      const headers = rawData[0];
      const columnIndices = findRequiredColumns(headers);
      
      // Check if we found all required columns
      const missingColumns = validateRequiredColumns(columnIndices);
      
      if (missingColumns.length > 0) {
        if (showToasts) {
          toast.error(`Fehlende Spalten in der Excel-Datei: ${missingColumns.join(", ")}`, {
            description: "Bitte überprüfen Sie das Format der Excel-Datei."
          });
        }
        console.error("Missing columns in Excel file:", missingColumns);
        console.log("Available headers:", headers);
        return false;
      }
      
      // Determine current week from the newest data in the file or from filename
      const weeks = extractWeeksFromData(rawData, columnIndices.weekColIndex);
      const currentWeek = determineCurrentWeek(this.file.name, weeks);
      
      if (!currentWeek && columnIndices.weekColIndex === -1) {
        if (showToasts) {
          toast.error("Konnte keine Wochendaten in der Excel-Datei finden", {
            description: "Bitte überprüfen Sie die Datei und versuchen Sie es erneut."
          });
        }
        return false;
      }
      
      // Extract and process the concession items
      const { concessionItems, allConcessionItems, weekToItems } = extractConcessionItems(
        rawData, 
        columnIndices, 
        currentWeek
      );
      
      // Get sorted list of available weeks
      const availableWeeks = getSortedAvailableWeeks(weekToItems);
      
      // Handle case where no items matched the current week
      const finalItems = this.handleEmptyCurrentWeek(concessionItems, allConcessionItems, weekToItems, availableWeeks, currentWeek);
      
      // Calculate total cost
      const totalCost = finalItems.reduce((sum, item) => sum + item.cost, 0);
      
      // Create the data object to store
      const concessionsData: ConcessionsData = {
        fileName: this.file.name,
        uploadDate: new Date().toISOString(),
        currentWeek,
        availableWeeks,
        items: allConcessionItems, // Store all items
        totalCost,
        weekToItems // Store items organized by week
      };
      
      // Save to local storage
      localStorage.setItem("concessionsData", JSON.stringify(concessionsData));
      
      if (showToasts) {
        toast.success(`Concessions Datei erfolgreich verarbeitet: ${this.file.name}`, {
          description: `${finalItems.length} Concessions für Woche ${currentWeek} gefunden.`
        });
      }
      
      this.handleUploadCompletion(concessionsData, finalItems.length, currentWeek);
      
      return true;
    } catch (error) {
      console.error("Error processing Concessions:", error);
      
      if (showToasts) {
        toast.error("Fehler bei der Verarbeitung der Concessions-Datei", {
          description: error instanceof Error ? error.message : "Unbekannter Fehler"
        });
      }
      
      throw error;
    } finally {
      this.setProcessing(false);
    }
  }
  
  /**
   * Find the appropriate sheet to use in the workbook
   */
  private findAppropriateSheet(workbook: XLSX.WorkBook): string {
    let sheetName = "DNR Concessions";
    if (!workbook.SheetNames.includes(sheetName)) {
      // Try alternative sheet names
      const possibleSheetNames = ["DNR Concessions", "DNR", "Concessions", "Concession", "DNR_Concessions"];
      for (const name of possibleSheetNames) {
        if (workbook.SheetNames.includes(name)) {
          sheetName = name;
          break;
        }
      }

      if (!workbook.SheetNames.includes(sheetName)) {
        // Still not found, try to use the first sheet
        sheetName = workbook.SheetNames[0];
        console.log(`DNR Concessions sheet not found, using first sheet: ${sheetName}`);
      }
    }
    
    return sheetName;
  }
  
  /**
   * Handle case where no items matched the current week
   */
  private handleEmptyCurrentWeek(
    concessionItems: ConcessionItem[],
    allConcessionItems: ConcessionItem[],
    weekToItems: Record<string, ConcessionItem[]>,
    availableWeeks: string[],
    currentWeek: string
  ): ConcessionItem[] {
    if (concessionItems.length === 0 && allConcessionItems.length > 0) {
      // No items matched the current week, use all items from the newest week
      const newestWeek = availableWeeks[0];
      if (newestWeek && weekToItems[newestWeek]) {
        return weekToItems[newestWeek];
      }
    }
    
    return concessionItems;
  }
  
  /**
   * Handle the completion of the upload and processing
   */
  private handleUploadCompletion(concessionsData: ConcessionsData, itemCount: number, currentWeek: string): void {
    if (this.onFileUpload) {
      this.onFileUpload(this.file, "excel", "concessions");
    }
    
    // Add file to upload history with some metadata
    this.addToUploadHistory(this.file, "excel", "concessions", {
      week: currentWeek,
      itemCount: itemCount,
      totalCost: concessionsData.totalCost.toFixed(2)
    });
  }
}
