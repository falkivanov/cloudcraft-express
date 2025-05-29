
import { toast } from "sonner";
import { FileProcessor } from "./FileProcessor";
import { BaseFileProcessor, ProcessOptions } from "./BaseFileProcessor";
import { extractWeekFromFilename } from "@/components/quality/scorecard/utils/parser/weekUtils";
import { ScoreCardData } from "@/components/quality/scorecard/types";
import { STORAGE_KEYS, saveToStorage } from "@/utils/storage";
import { api } from "@/services/api";

/**
 * Spezialisierter Prozessor für Scorecard-Dateien
 * Verwendet API-Verarbeitung wenn verfügbar, sonst Fehler ausgeben
 */
export class ScorecardProcessor extends BaseFileProcessor {
  constructor(
    file: File,
    setProcessing: (value: boolean) => void,
    onFileUpload?: (file: File, type: string, category: string) => void
  ) {
    super(file, "scorecard", setProcessing, onFileUpload);
  }

  /**
   * Verarbeitet die Scorecard-Datei über die API
   * Keine Fallback-Verarbeitung - Backend muss verfügbar sein
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
      // Prüfe API-Verfügbarkeit
      const isApiAvailable = await api.checkHealth().catch(() => false);
      
      if (!isApiAvailable) {
        const errorMessage = "API ist nicht erreichbar. Bitte starten Sie den Backend-Server.";
        console.error(errorMessage);
        
        if (showToasts) {
          toast.error(errorMessage);
        }
        
        return false;
      }

      console.log("API ist verfügbar, starte Backend-Extraktion");
      const apiResult = await api.scorecard.extract(this.file);
      
      console.log("DEBUG: API result:", apiResult);
      
      if (apiResult.success && apiResult.data) {
        const scoreCardData = apiResult.data;
        const weekNum = scoreCardData.week || extractWeekFromFilename(this.file.name);
        
        console.log(`DEBUG: API extraction successful for week ${weekNum}`);
        
        // Speichere Daten im aktuellen Wochenspeicher
        const currentYearWeekKey = `scorecard_data_week_${weekNum}_${scoreCardData.year}`;
        saveToStorage(currentYearWeekKey, scoreCardData);
        console.log(`DEBUG: Saved to localStorage with key: ${currentYearWeekKey}`);
        
        // Speichere im zentralen Speicher
        saveToStorage(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA, scoreCardData);
        console.log(`DEBUG: Saved to central storage: ${STORAGE_KEYS.EXTRACTED_SCORECARD_DATA}`);
        
        // Legacy-Speicherung für Kompatibilität
        localStorage.setItem("extractedScorecardData", JSON.stringify(scoreCardData));
        console.log(`DEBUG: Saved to legacy storage: extractedScorecardData`);
        
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
        
        window.dispatchEvent(new CustomEvent('scorecardDataUpdated', {
          detail: { week: weekNum, year: scoreCardData.year }
        }));
        
        return true;
      } else {
        const errorMessage = apiResult.error || "Unbekannter Fehler bei der Backend-Verarbeitung";
        console.error("API extraction failed:", errorMessage);
        
        if (showToasts) {
          toast.error(`Fehler bei der Backend-Verarbeitung: ${errorMessage}`);
        }
        
        return false;
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
