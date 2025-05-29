
import { toast } from "sonner";
import { FileProcessor } from "./FileProcessor";
import { BaseFileProcessor, ProcessOptions } from "./BaseFileProcessor";
import { extractWeekFromFilename } from "@/components/quality/scorecard/utils/parser/weekUtils";
import { ScoreCardData } from "@/components/quality/scorecard/types";
import { STORAGE_KEYS, saveToStorage } from "@/utils/storage";
import { api } from "@/services/api";

/**
 * Spezialisierter Prozessor für Scorecard-Dateien
 * Verwendet ausschließlich API-Verarbeitung
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
    console.log(`DEBUG: Saving scorecard data for week ${weekNum}, year ${data.year}`);
    
    // Speichere Daten im aktuellen Wochenspeicher
    const currentYearWeekKey = `scorecard_data_week_${weekNum}_${data.year}`;
    saveToStorage(currentYearWeekKey, data);
    console.log(`DEBUG: Saved to localStorage with key: ${currentYearWeekKey}`);
    
    // Speichere im zentralen Speicher
    saveToStorage(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA, data);
    console.log(`DEBUG: Saved to central storage: ${STORAGE_KEYS.EXTRACTED_SCORECARD_DATA}`);
    
    // Legacy-Speicherung für Kompatibilität
    localStorage.setItem("extractedScorecardData", JSON.stringify(data));
    console.log(`DEBUG: Saved to legacy storage: extractedScorecardData`);
    
    console.log(`Gespeicherte Scorecard-Daten für Woche ${weekNum} mit ${data.driverKPIs?.length || 0} Fahrern`);
  }

  /**
   * Verarbeitet die Scorecard-Datei ausschließlich über die API
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
      // API-Verfügbarkeit prüfen
      const isApiAvailable = await api.checkHealth().catch(() => false);
      
      if (!isApiAvailable) {
        throw new Error("API ist nicht erreichbar. Bitte starten Sie den Backend-Server.");
      }
      
      // Wenn die API verfügbar ist, verwende sie zur Extraktion
      console.log("API ist verfügbar, starte Backend-Extraktion");
      const apiResult = await api.scorecard.extract(this.file);
      
      console.log("DEBUG: API result:", apiResult);
      
      if (apiResult.success && apiResult.data) {
        // Verarbeite das Ergebnis
        const scoreCardData = apiResult.data;
        const weekNum = scoreCardData.week || extractWeekFromFilename(this.file.name);
        
        console.log(`DEBUG: Extracted week ${weekNum} from API response or filename`);
        
        // Daten speichern
        this.saveScorecardData(scoreCardData, weekNum);
        
        // Trigger des Upload-Callbacks
        if (this.onFileUpload) {
          this.onFileUpload(this.file, this.file.type, this.category);
        }
        
        if (showToasts) {
          toast.success(
            `Scorecard KW${weekNum} erfolgreich verarbeitet. Möchten Sie die Daten jetzt ansehen?`,
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
        
        console.log(`Scorecard erfolgreich verarbeitet: ${this.file.name} für KW${weekNum}`);
        
        // Event auslösen, dass neue Daten verfügbar sind
        window.dispatchEvent(new CustomEvent('scorecardDataUpdated', {
          detail: { week: weekNum, year: scoreCardData.year }
        }));
        
        return true;
      } else {
        throw new Error(apiResult.error || "API-Extraktion fehlgeschlagen");
      }
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
