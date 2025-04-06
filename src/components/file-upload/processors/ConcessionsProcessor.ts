
import { toast } from "sonner";
import { BaseFileProcessor, ProcessOptions } from "./BaseFileProcessor";
import * as XLSX from "xlsx";
import { ConcessionItem, ConcessionsData } from "@/components/quality/concessions/types";

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
      const arrayBuffer = await this.readFileAsArrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      
      // Check if DNR Concessions sheet exists
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
      
      // Process the sheet
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
      
      // Define possible column name patterns - updated with exact column names
      const weekPatterns = ["wk", "week", "kw", "kalenderwoche"];
      const transportIdPatterns = ["transporter_id", "transport id", "transport-id", "transport_id", "transportid"];
      const trackingIdPatterns = ["tracking_id", "tracking id", "tracking-id", "tracking_id", "trackingid"];
      const deliveryDatePatterns = ["delivery_date_time", "delivery date", "delivery-date", "delivery_date", "deliverydate", "datum"];
      const reasonPatterns = ["shipment_reason", "shipment reason", "reason code", "reason", "grund"];
      const costPatterns = ["concession cost", "Concession Cost", "cost", "kosten", "amount"];
      
      // Find columns using flexible matching
      const weekColIndex = this.findColumnIndex(headers, weekPatterns);
      const transportIdColIndex = this.findColumnIndex(headers, transportIdPatterns);
      const trackingIdColIndex = this.findColumnIndex(headers, trackingIdPatterns);
      const deliveryDateColIndex = this.findColumnIndex(headers, deliveryDatePatterns);
      const reasonColIndex = this.findColumnIndex(headers, reasonPatterns);
      const costColIndex = this.findColumnIndex(headers, costPatterns);
      
      // Check if we found all required columns
      const missingColumns = [];
      if (transportIdColIndex === -1) missingColumns.push("Transport ID");
      if (trackingIdColIndex === -1) missingColumns.push("Tracking ID");
      if (deliveryDateColIndex === -1) missingColumns.push("Delivery Date");
      if (reasonColIndex === -1) missingColumns.push("Shipment Reason");
      if (costColIndex === -1) missingColumns.push("Concession Cost");
      
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
      const weeks = new Set<string>();
      for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i];
        if (row && weekColIndex !== -1 && row[weekColIndex]) {
          weeks.add(row[weekColIndex].toString());
        }
      }
      
      let currentWeek = "";
      
      // Try to extract week from filename first (e.g., Week13, KW13, WK13)
      const weekPattern = /(?:week|kw|wk)[- _]?(\d+)/i;
      const weekMatch = this.file.name.match(weekPattern);
      
      if (weekMatch && weekMatch[1]) {
        currentWeek = `WK${weekMatch[1]}`;
        console.log(`Extracted week from filename: ${currentWeek}`);
      } else {
        // Otherwise use the newest week from the data
        const weeksList = Array.from(weeks).sort((a, b) => {
          // Sort in descending order (newest week first)
          const numA = parseInt(a.replace(/\D/g, ''));
          const numB = parseInt(b.replace(/\D/g, ''));
          return numB - numA;
        });
        
        currentWeek = weeksList.length > 0 ? weeksList[0] : "";
        console.log(`Using newest week from data: ${currentWeek}`);
      }
      
      if (!currentWeek && weekColIndex === -1) {
        if (showToasts) {
          toast.error("Konnte keine Wochendaten in der Excel-Datei finden", {
            description: "Bitte überprüfen Sie die Datei und versuchen Sie es erneut."
          });
        }
        return false;
      }
      
      // Filter and transform the data
      const concessionItems: ConcessionItem[] = [];
      const allConcessionItems: ConcessionItem[] = [];
      
      // Process all rows, organizing data by week
      const weekToItems: Record<string, ConcessionItem[]> = {};
      
      for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i];
        
        // Skip empty rows
        if (!row || row.length === 0) continue;
        
        // Extract week value
        let weekValue = "";
        if (weekColIndex !== -1) {
          weekValue = row[weekColIndex]?.toString() || "";
          if (!weekValue) continue;
          
          // Normalize week format
          if (!/^wk\d+$/i.test(weekValue)) {
            const weekNum = weekValue.replace(/\D/g, '');
            if (weekNum) {
              weekValue = `WK${weekNum}`;
            }
          }
        } else {
          // If we couldn't find a week column, assign all items to the current week
          weekValue = currentWeek;
        }
        
        // Extract the values we need
        const transportId = row[transportIdColIndex]?.toString() || "";
        const trackingId = row[trackingIdColIndex]?.toString() || "";
        let deliveryDate = row[deliveryDateColIndex];
        
        if (deliveryDate instanceof Date) {
          deliveryDate = deliveryDate.toISOString();
        } else {
          deliveryDate = deliveryDate?.toString() || "";
        }
        
        const reason = row[reasonColIndex]?.toString() || "";
        let cost = 0;
        if (row[costColIndex] !== undefined && row[costColIndex] !== null) {
          const costVal = parseFloat(row[costColIndex].toString());
          if (!isNaN(costVal)) {
            cost = costVal;
          }
        }
        
        const item = {
          transportId,
          trackingId,
          deliveryDateTime: deliveryDate,
          reason,
          cost
        };
        
        // Store all items and organize by week
        allConcessionItems.push(item);
        
        if (!weekToItems[weekValue]) {
          weekToItems[weekValue] = [];
        }
        weekToItems[weekValue].push(item);
        
        // Also add to current week items if it matches
        if (weekValue.toUpperCase() === currentWeek.toUpperCase()) {
          concessionItems.push(item);
        }
      }
      
      // Get sorted list of available weeks
      const availableWeeks = Object.keys(weekToItems).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''));
        const numB = parseInt(b.replace(/\D/g, ''));
        return numB - numA; // descending order
      });
      
      if (concessionItems.length === 0 && allConcessionItems.length > 0) {
        // No items matched the current week, use all items from the newest week
        const newestWeek = availableWeeks[0];
        if (newestWeek && weekToItems[newestWeek]) {
          concessionItems.push(...weekToItems[newestWeek]);
          currentWeek = newestWeek;
        }
      }
      
      // Calculate total cost
      const totalCost = concessionItems.reduce((sum, item) => sum + item.cost, 0);
      
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
          description: `${concessionItems.length} Concessions für Woche ${currentWeek} gefunden.`
        });
      }
      
      if (this.onFileUpload) {
        this.onFileUpload(this.file, "excel", "concessions");
      }
      
      // Add file to upload history with some metadata
      this.addToUploadHistory(this.file, "excel", "concessions", {
        week: currentWeek,
        itemCount: concessionItems.length,
        totalCost: concessionsData.totalCost.toFixed(2)
      });
      
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
   * Read the file content as ArrayBuffer
   */
  private readFileAsArrayBuffer(): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as ArrayBuffer;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error("Fehler beim Lesen der Datei"));
      };
      
      reader.readAsArrayBuffer(this.file);
    });
  }

  /**
   * Find column index based on flexible pattern matching
   */
  private findColumnIndex(headers: any[], patterns: string[]): number {
    for (const pattern of patterns) {
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i]?.toString().toLowerCase() || "";
        if (header.includes(pattern)) {
          return i;
        }
      }
    }
    return -1;
  }
}
