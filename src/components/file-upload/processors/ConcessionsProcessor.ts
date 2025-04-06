
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
      const sheetName = "DNR Concessions";
      if (!workbook.SheetNames.includes(sheetName)) {
        if (showToasts) {
          toast.error(`Fehlerhafte Excel-Datei: Sheet "${sheetName}" nicht gefunden`, {
            description: "Bitte überprüfen Sie die Datei und versuchen Sie es erneut."
          });
        }
        return false;
      }
      
      // Process the DNR Concessions sheet
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
      
      // Extract header row and find column indices
      const headers = rawData[0];
      const weekColIndex = headers.findIndex((h: string) => h?.toString().toLowerCase().includes("wk"));
      const transportIdColIndex = headers.findIndex((h: string) => h?.toString().toLowerCase().includes("transport id"));
      const trackingIdColIndex = headers.findIndex((h: string) => h?.toString().toLowerCase().includes("tracking id"));
      const deliveryDateColIndex = headers.findIndex((h: string) => h?.toString().toLowerCase().includes("delivery date"));
      const reasonColIndex = headers.findIndex((h: string) => h?.toString().toLowerCase().includes("shipment reason") || 
                                                    h?.toString().toLowerCase().includes("reason code"));
      const costColIndex = headers.findIndex((h: string) => h?.toString().toLowerCase().includes("concession cost") || 
                                                 h?.toString().toLowerCase().includes("cost"));
      
      // Check if we found all required columns
      const missingColumns = [];
      if (weekColIndex === -1) missingColumns.push("Week");
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
        return false;
      }
      
      // Determine current week from the newest data in the file
      const weeks = new Set<string>();
      for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i];
        if (row && row[weekColIndex]) {
          weeks.add(row[weekColIndex].toString());
        }
      }
      
      const weeksList = Array.from(weeks).sort((a, b) => {
        // Sort in descending order (newest week first)
        const numA = parseInt(a.replace(/\D/g, ''));
        const numB = parseInt(b.replace(/\D/g, ''));
        return numB - numA;
      });
      
      const currentWeek = weeksList.length > 0 ? weeksList[0] : null;
      
      if (!currentWeek) {
        if (showToasts) {
          toast.error("Konnte keine Wochendaten in der Excel-Datei finden", {
            description: "Bitte überprüfen Sie die Datei und versuchen Sie es erneut."
          });
        }
        return false;
      }
      
      // Filter and transform the data
      const concessionItems: ConcessionItem[] = [];
      
      for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i];
        
        // Skip if row is empty or doesn't match the current week
        if (!row || !row[weekColIndex] || row[weekColIndex].toString() !== currentWeek) {
          continue;
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
        
        concessionItems.push({
          transportId,
          trackingId,
          deliveryDateTime: deliveryDate,
          reason,
          cost
        });
      }
      
      // Create the data object to store
      const concessionsData: ConcessionsData = {
        fileName: this.file.name,
        uploadDate: new Date().toISOString(),
        currentWeek,
        availableWeeks: weeksList,
        items: concessionItems,
        totalCost: concessionItems.reduce((sum, item) => sum + item.cost, 0)
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
}
