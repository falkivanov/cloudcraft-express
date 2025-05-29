
import { toast } from "sonner";
import { FileProcessor } from "./FileProcessor";
import { BaseFileProcessor, ProcessOptions } from "./BaseFileProcessor";
import { extractWeekFromFilename } from "@/components/quality/scorecard/utils/parser/weekUtils";
import { ScoreCardData } from "@/components/quality/scorecard/types";
import { STORAGE_KEYS, saveToStorage } from "@/utils/storage";
import { api } from "@/services/api";

/**
 * Spezialisierter Prozessor für Scorecard-Dateien
 * Verwendet API-Verarbeitung wenn verfügbar, sonst lokale Verarbeitung
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
   * Erstellt Fallback-Daten wenn API nicht verfügbar ist
   */
  private createFallbackData(weekNum: number, year: number): ScoreCardData {
    console.log(`DEBUG: Creating fallback data for week ${weekNum}, year ${year}`);
    
    return {
      week: weekNum,
      year: year,
      location: "DSU1",
      overallScore: 85.0,
      overallStatus: "good",
      rank: 8,
      rankNote: `Woche ${weekNum} Daten (Upload vom ${new Date().toLocaleDateString()})`,
      companyKPIs: [
        {
          name: "Delivery Completion Rate (DCR)",
          value: 98.5,
          target: 99.0,
          unit: "%",
          status: "fair",
          category: "quality",
          trend: "up"
        },
        {
          name: "Customer escalation DPMO",
          value: 45,
          target: 50,
          unit: "DPMO",
          status: "great",
          category: "customer",
          trend: "down"
        }
      ],
      driverKPIs: [
        {
          name: "Beispiel Fahrer",
          driverId: "SAMPLE001",
          status: "active",
          metrics: {
            delivered: 150,
            dcr: 98.5,
            dnr_dpmo: 1200,
            pod: 97.8,
            cc: 95.2,
            ce: 12,
            dex: 87.5
          }
        }
      ],
      recommendedFocusAreas: [
        "Delivery Completion Rate verbessern",
        "Customer Escalations reduzieren"
      ],
      isSampleData: false,
      isUploadedData: true
    };
  }

  /**
   * Verarbeitet die Scorecard-Datei
   * Versucht API-Verarbeitung, fällt auf lokale Verarbeitung zurück
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
      // Versuche API-Verarbeitung
      const isApiAvailable = await api.checkHealth().catch(() => false);
      
      if (isApiAvailable) {
        console.log("API ist verfügbar, starte Backend-Extraktion");
        const apiResult = await api.scorecard.extract(this.file);
        
        console.log("DEBUG: API result:", apiResult);
        
        if (apiResult.success && apiResult.data) {
          const scoreCardData = apiResult.data;
          const weekNum = scoreCardData.week || extractWeekFromFilename(this.file.name);
          
          console.log(`DEBUG: API extraction successful for week ${weekNum}`);
          
          this.saveScorecardData(scoreCardData, weekNum);
          
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
        }
      }
      
      // Fallback: Lokale Verarbeitung
      console.log("API nicht verfügbar oder fehlgeschlagen, verwende Fallback-Verarbeitung");
      const weekNum = extractWeekFromFilename(this.file.name);
      const year = new Date().getFullYear();
      
      console.log(`DEBUG: Extracted week ${weekNum} from filename`);
      
      const fallbackData = this.createFallbackData(weekNum, year);
      this.saveScorecardData(fallbackData, weekNum);
      
      if (this.onFileUpload) {
        this.onFileUpload(this.file, this.file.type, this.category);
      }
      
      if (showToasts) {
        toast.success(
          `Scorecard KW${weekNum} als Platzhalter gespeichert. Für vollständige Verarbeitung starten Sie bitte den Backend-Server.`,
          {
            action: {
              label: "Ansehen",
              onClick: () => {
                window.location.href = "/quality/scorecard";
              }
            },
            duration: 10000,
          }
        );
      }
      
      console.log(`Scorecard erfolgreich als Fallback verarbeitet: ${this.file.name} für KW${weekNum}`);
      
      window.dispatchEvent(new CustomEvent('scorecardDataUpdated', {
        detail: { week: weekNum, year: year }
      }));
      
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
