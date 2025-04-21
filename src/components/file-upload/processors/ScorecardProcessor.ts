
import { toast } from "sonner";
import { FileProcessor } from "./FileProcessor";
import { BaseFileProcessor, ProcessOptions } from "./BaseFileProcessor";
import { extractWeekFromFilename } from "@/components/quality/scorecard/utils/parser/weekUtils";
import { parseScorecardPDF } from "@/components/quality/scorecard/utils/pdfParser";
import { ScoreCardData } from "@/components/quality/scorecard/types";
import { STORAGE_KEYS, saveToStorage } from "@/utils/storage";
import { api } from "@/services/api";

/**
 * Spezialisierter Prozessor für Scorecard-Dateien
 * Mit Vorbereitung für API-Integration
 */
export class ScorecardProcessor extends BaseFileProcessor {
  constructor(
    file: File,
    setProcessing: (value: boolean) => void,
    onFileUpload?: (file: File, type: string, category: string) => void
  ) {
    super(file, "scorecard", setProcessing, onFileUpload);
  }

  private saveScorecardData(data: ScoreCardData, weekNum: number): void {
    // Speichere Daten im aktuellen Wochenspeicher
    const currentYearWeekKey = `scorecard_data_week_${weekNum}_${new Date().getFullYear()}`;
    saveToStorage(currentYearWeekKey, data);
    
    // Speichere im zentralen Speicher
    saveToStorage(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA, data);
    
    // Legacy-Speicherung für Kompatibilität
    localStorage.setItem("extractedScorecardData", JSON.stringify(data));
    
    console.log(`Gespeicherte Scorecard-Daten für Woche ${weekNum} mit ${data.driverKPIs?.length || 0} Fahrern`);
  }

  /**
   * Verarbeitet die Scorecard-Datei
   * Vorbereitet für zukünftige API-Integration
   */
  public async process(options: ProcessOptions = {}): Promise<boolean> {
    const { showToasts = true } = options;
    
    if (!this.file) {
      console.error("Keine Datei zum Verarbeiten");
      return false;
    }
    
    this.setProcessing(true);
    console.log(`Processing scorecard file: ${this.file.name}`);
    
    try {
      // Hier zuerst API-Verfügbarkeit prüfen
      const isApiAvailable = await api.checkHealth().catch(() => false);
      
      if (isApiAvailable) {
        try {
          console.log("API ist verfügbar, versuche API-basierte Extraktion");
          
          // Wenn die API verfügbar ist, verwende sie
          // Beispiel für die zukünftige Implementierung:
          /*
          const apiResult = await api.scorecard.extract(this.file);
          
          if (apiResult.success && apiResult.data) {
            // Verarbeite das Ergebnis
            const weekNum = apiResult.data.week;
            this.saveScorecardData(apiResult.data, weekNum);
            
            if (showToasts) {
              toast.success("Scorecard erfolgreich verarbeitet!");
            }
            
            // Trigger des Upload-Callbacks
            if (this.onFileUpload) {
              this.onFileUpload(this.file, this.file.type, this.category);
            }
            
            console.log(`Scorecard erfolgreich verarbeitet: ${this.file.name}`);
            return true;
          } else {
            throw new Error(apiResult.error || "API-Extraktion fehlgeschlagen");
          }
          */
          
          // Da die API noch nicht implementiert ist, fallback zur lokalen Verarbeitung
          throw new Error("API-Extraktion nicht implementiert");
        } catch (apiError) {
          console.log("API-Fehler, wechsle zur lokalen Verarbeitung:", apiError);
          // Fallback zur lokalen Verarbeitung
        }
      }
      
      // Lokale Verarbeitung, wenn API nicht verfügbar oder fehlgeschlagen ist
      const fileBuffer = await this.file.arrayBuffer();
      const weekNum = extractWeekFromFilename(this.file.name);
      
      const scoreCardData = await parseScorecardPDF(
        fileBuffer, 
        this.file.name,
        true
      );
      
      // Daten speichern
      this.saveScorecardData(scoreCardData, weekNum);
      
      // Trigger des Upload-Callbacks
      if (this.onFileUpload) {
        this.onFileUpload(this.file, this.file.type, this.category);
      }
      
      if (showToasts) {
        toast.success(
          "Scorecard erfolgreich verarbeitet. Möchten Sie die Daten jetzt ansehen?",
          {
            action: {
              label: "Ja",
              onClick: () => {
                window.location.href = "/quality/scorecard";
              }
            },
            duration: 10000,
          }
        );
      }
      
      console.log(`Scorecard erfolgreich verarbeitet: ${this.file.name}`);
      return true;
    } catch (error) {
      console.error("Fehler bei der Verarbeitung der Scorecard:", error);
      
      if (showToasts) {
        toast.error(`Fehler bei der Verarbeitung: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`);
      }
      
      return false;
    } finally {
      this.setProcessing(false);
    }
  }
}
