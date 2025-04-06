
import { ScoreCardData } from '../types';
import { PDFParseError } from './parser/PDFParseError';
import { extractWeekFromFilename } from './parser/weekUtils';
import { getSampleDataWithWeek } from './parser/sampleDataProvider';
import { loadPDFDocument } from './parser/pdfDocumentLoader';
import { 
  attemptPositionalExtraction,
  attemptTextBasedExtraction,
  createFallbackData
} from './parser/extractionStrategies';
import { STORAGE_KEYS, saveToStorage } from '@/utils/storage';

// Definiere ein konkretes Interface für das Extraktionsergebnis
interface ExtractionResult {
  success: boolean;
  data: ScoreCardData | null;
  error: any;
}

/**
 * Parse a scorecard PDF and extract data with improved driver extraction
 * @param pdfData ArrayBuffer containing the PDF data
 * @param filename Original filename (used for KW extraction)
 * @param detailedLogging Enable detailed logging for debugging
 * @returns Promise with the parsed ScoreCardData
 */
export const parseScorecardPDF = async (
  pdfData: ArrayBuffer,
  filename: string,
  detailedLogging: boolean = true  // Default auf true für beste Fehlerbehebung
): Promise<ScoreCardData> => {
  try {
    console.info("Starte PDF-Parsing für: ", filename);
    
    // Extrahiere Wochennummer aus Dateinamen mit verbessertem Extraktor
    const extractedWeek = extractWeekFromFilename(filename);
    console.info("Extrahierte Wochennummer:", extractedWeek);
    
    // Lade das PDF-Dokument
    try {
      const pdf = await loadPDFDocument(pdfData);
      console.info(`PDF geladen mit ${pdf.numPages} Seiten`);
      
      // Versuche mehrere Extraktionsansätze, um die Fahrererkennung zu maximieren
      
      // Erster Versuch: Positionale Extraktion (am zuverlässigsten, wenn es funktioniert)
      const positionalResult = await attemptPositionalExtraction(pdf, filename, detailedLogging);
      let extractedData;
      
      if (positionalResult.success && positionalResult.data && 
          positionalResult.data.driverKPIs && positionalResult.data.driverKPIs.length >= 10) {
        // Positionale Extraktion hat gut funktioniert
        extractedData = positionalResult.data;
        console.log(`Positionale Extraktion erfolgreich mit ${extractedData.driverKPIs?.length || 0} Fahrern`);
      } else {
        // Wenn die positionale Extraktion fehlgeschlagen ist oder wenige Fahrer gefunden hat, versuche textbasierte Extraktion
        console.log("Positionale Extraktion hat nicht genug Fahrer gefunden, versuche textbasierte Extraktion");
        
        // Cast um sicherzustellen, dass wir alle erforderlichen Eigenschaften haben
        const textBasedResult: ExtractionResult = {
          success: false,
          data: null,
          error: null,
          ...await attemptTextBasedExtraction(pdf, extractedWeek, detailedLogging)
        };
        
        if (textBasedResult.success && textBasedResult.data && 
            textBasedResult.data.driverKPIs && textBasedResult.data.driverKPIs.length >= 5) {
          // Textbasierte Extraktion hat funktioniert
          extractedData = textBasedResult.data;
          console.log(`Textbasierte Extraktion erfolgreich mit ${extractedData.driverKPIs?.length || 0} Fahrern`);
        } else if (positionalResult.data && positionalResult.data.driverKPIs && 
                  positionalResult.data.driverKPIs.length > 0) {
          // Fallback auf teilweise positionale Ergebnisse, wenn sie zumindest einige Fahrer gefunden haben
          extractedData = positionalResult.data;
          console.log(`Verwende teilweise positionale Ergebnisse mit ${extractedData.driverKPIs?.length || 0} Fahrern`);
        } else if (textBasedResult.data && textBasedResult.data.driverKPIs && 
                  textBasedResult.data.driverKPIs.length > 0) {
          // Fallback auf teilweise textbasierte Ergebnisse
          extractedData = textBasedResult.data;
          console.log(`Verwende teilweise textbasierte Ergebnisse mit ${extractedData.driverKPIs?.length || 0} Fahrern`);
        } else {
          // Letzter Ausweg: Verwende einfache Fallback-Daten
          console.log("Keine Extraktionsmethode hat Fahrer gefunden, verwende Fallback-Daten");
          extractedData = createFallbackData(extractedWeek);
        }
      }
      
      // Kombination aus beiden Ergebnissen für maximale Fahrererkennung
      if (positionalResult.data?.driverKPIs && extractedData.driverKPIs && 
          positionalResult.data.driverKPIs.length > 0 &&
          extractedData !== positionalResult.data) {
        
        const existingDriverIds = new Set(extractedData.driverKPIs.map(d => d.name));
        
        // Füge Fahrer hinzu, die wir noch nicht haben
        const additionalDrivers = positionalResult.data.driverKPIs.filter(
          d => !existingDriverIds.has(d.name)
        );
        
        if (additionalDrivers.length > 0) {
          console.log(`Füge ${additionalDrivers.length} zusätzliche Fahrer aus anderer Extraktionsmethode hinzu`);
          extractedData.driverKPIs = [...extractedData.driverKPIs, ...additionalDrivers];
        }
      }
      
      // Ensure week and year are properly set
      if (extractedWeek) {
        let week: number;
        if (typeof extractedWeek === 'number') {
          week = extractedWeek;
        } else if (typeof extractedWeek === 'string') {
          // Convert string to number, removing any non-digit characters
          week = parseInt(extractedWeek.replace(/\D/g, ''));
        } else {
          // Default to current week if we can't parse
          week = new Date().getWeek();
        }
        extractedData.week = week;
      }
      
      // Wenn Jahr fehlt, verwende das aktuelle Jahr
      if (!extractedData.year) {
        extractedData.year = new Date().getFullYear();
      }
      
      console.log(`Endergebnis der Extraktion: ${extractedData.driverKPIs?.length || 0} Fahrer`);
      
      // Speichere Daten an beiden Stellen für Kompatibilität
      saveToStorage(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA, extractedData);
      localStorage.setItem("extractedScorecardData", JSON.stringify(extractedData));
      
      return extractedData;
    } catch (error) {
      console.error('Fehler mit dem PDF-Dokument:', error);
      // Verwende Beispieldaten als Fallback, aber markiere sie als Beispieldaten
      let weekString: string;
      if (typeof extractedWeek === 'number') {
        weekString = extractedWeek.toString();
      } else if (typeof extractedWeek === 'string') {
        weekString = extractedWeek;
      } else {
        weekString = "1"; // Default when we can't get a week
      }
      
      const data = await getSampleDataWithWeek(weekString);
      console.info("Verwende Beispieldaten aufgrund eines PDF-Verarbeitungsfehlers");
      
      // Speichere Daten an beiden Stellen
      const resultData = {...data, isSampleData: true};
      
      // Speichere Daten an beiden Stellen
      saveToStorage(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA, resultData);
      localStorage.setItem("extractedScorecardData", JSON.stringify(resultData));
      
      return resultData;
    }
  } catch (error) {
    console.error('Fehler beim Parsen der PDF:', error);
    
    // Handle the case properly
    let weekString = "";
    try {
      // Fix: Define extractedWeek in this scope
      const extractedWeek = extractWeekFromFilename(filename);
      if (typeof extractedWeek !== 'undefined') {
        weekString = typeof extractedWeek === 'number' ? extractedWeek.toString() : String(extractedWeek);
      } else {
        const currentDate = new Date();
        if (typeof (currentDate as any).getWeek === 'function') {
          weekString = (currentDate as any).getWeek().toString();
        } else {
          weekString = "1"; // Fallback if getWeek isn't available
        }
      }
    } catch (weekError) {
      weekString = "1"; // Ultimate fallback
      console.error("Error getting week:", weekError);
    }
    
    // Verwende Beispieldaten als Fallback, aber markiere sie als Beispieldaten
    const data = await getSampleDataWithWeek(weekString);
    console.info("Verwende Beispieldaten aufgrund eines allgemeinen Parsing-Fehlers");
    
    // Speichere die Beispieldaten konsistent mit beiden Methoden
    const resultData = {...data, isSampleData: true};
    
    // Speichere Daten an beiden Stellen
    saveToStorage(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA, resultData);
    localStorage.setItem("extractedScorecardData", JSON.stringify(resultData));
    
    return resultData;
  }
};
