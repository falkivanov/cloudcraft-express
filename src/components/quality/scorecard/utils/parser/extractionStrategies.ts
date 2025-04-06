
import { ScoreCardData } from '../../types';
import { extractDriverKPIs } from './extractors/driver';
import { extractCompanyKPIs } from '../extractors/companyKpiExtractor';
import { extractTextFromPDF, extractPDFContentWithPositions } from './pdf/contentExtractor';
import { 
  extractLocation, 
  extractOverallScore, 
  extractOverallStatus, 
  extractRank, 
  extractRankChange,
  extractFocusAreas
} from '../extractors/metadataExtractor';
import { extractDriversFromAllPages } from './extractors/driver/text/pageExtractor';
import { extractDriverKPIsFromStructure } from './extractors/driver/structural/structuralExtractor';
import { extractWeekFromFilename } from './weekUtils';

/**
 * Versuche die Extraktion mit dem positionalen Ansatz
 * @param pdf Das geladene PDF-Dokument
 * @param filename Original Dateiname
 * @param detailedLogging Aktiviere detailliertes Logging
 * @returns Extraktionsergebnis
 */
export const attemptPositionalExtraction = async (
  pdf: any, 
  filename: string,
  detailedLogging: boolean = false
): Promise<{success: boolean, data: ScoreCardData | null, error: any}> => {
  try {
    console.log("Versuche positionale Extraktion");
    
    // Extrahiere Text und Positionsdaten aus dem PDF
    const pageData = await extractPDFContentWithPositions(pdf);
    
    // Extrahiere auch den Volltext für bestimmte Extraktoren
    const { companyText, fullText, pageTexts } = await extractTextFromPDF(pdf);
    
    // Extrahiere Fahrer-KPIs mit dem strukturellen Ansatz
    const driverKPIs = extractDriverKPIsFromStructure(pageData);
    const totalDrivers = driverKPIs.length;
    console.log(`Extrahiert: ${totalDrivers} Fahrer mit strukturellem Ansatz`);
    
    // Fahrer-Extraktion als erfolgreich betrachten, wenn mindestens 8 Fahrer gefunden wurden
    const driversSuccessful = totalDrivers >= 8;
    
    if (detailedLogging) {
      console.log(`Gefundene Fahrer-IDs: ${driverKPIs.slice(0, 5).map(d => d.name).join(', ')}${totalDrivers > 5 ? '...' : ''}`);
    }
    
    // Extrahiere andere Daten
    const companyKPIs = extractCompanyKPIs(companyText);
    const location = extractLocation(fullText);
    const overallScore = extractOverallScore(fullText);
    const overallStatus = extractOverallStatus(overallScore);
    const rank = extractRank(fullText);
    const weekString = extractWeekFromFilename(filename);
    const week = typeof weekString === 'string' ? parseInt(weekString.replace(/\D/g, '')) : weekString;
    const year = new Date().getFullYear();
    
    // Erstelle Kategorien für KPIs
    const categorizedKPIs = {
      safety: companyKPIs.filter(kpi => kpi.category === "safety"),
      compliance: companyKPIs.filter(kpi => kpi.category === "compliance"),
      customer: companyKPIs.filter(kpi => kpi.category === "customer"),
      standardWork: companyKPIs.filter(kpi => kpi.category === "standardWork"),
      quality: companyKPIs.filter(kpi => kpi.category === "quality"),
      capacity: companyKPIs.filter(kpi => kpi.category === "capacity")
    };
    
    // Identifiziere Fokus-Bereiche basierend auf schlechten KPIs
    const recommendedFocusAreas = companyKPIs
      .filter(kpi => kpi.status === "poor" || kpi.status === "fair")
      .sort((a, b) => {
        // Priorisiere "poor" vor "fair"
        if (a.status === "poor" && b.status !== "poor") return -1;
        if (a.status !== "poor" && b.status === "poor") return 1;
        return 0;
      })
      .slice(0, 3)
      .map(kpi => kpi.name);
    
    // Stelle die Scorecard-Daten zusammen
    const data: ScoreCardData = {
      week,
      year,
      location,
      overallScore,
      overallStatus,
      rank,
      rankNote: "",
      companyKPIs,
      categorizedKPIs,
      driverKPIs,
      recommendedFocusAreas,
      isSampleData: false
    };
    
    return { 
      success: driversSuccessful, 
      data, 
      error: null 
    };
  } catch (error) {
    console.error("Fehler bei positionaler Extraktion:", error);
    return { 
      success: false, 
      data: null, 
      error 
    };
  }
};

/**
 * Versuche die Extraktion mit dem textbasierten Ansatz
 * @param pdf Das geladene PDF-Dokument
 * @param weekNum Wochennummer aus dem Dateinamen
 * @param detailedLogging Aktiviere detailliertes Logging
 * @returns Extraktionsergebnis
 */
export const attemptTextBasedExtraction = async (
  pdf: any,
  weekNum: string | number,
  detailedLogging: boolean = false
): Promise<{success: boolean, data: ScoreCardData | null, error: any}> => {
  try {
    console.log("Versuche textbasierte Extraktion");
    
    // Extrahiere Text aus dem PDF
    const { companyText, fullText, pageTexts } = await extractTextFromPDF(pdf);
    
    // Extrahiere Fahrer-KPIs mit dem verbesserten textbasierten Ansatz
    const driverKPIs = extractDriversFromAllPages(pageTexts);
    
    // Wenn keine Fahrer gefunden wurden, versuche den klassischen Extraktor
    if (driverKPIs.length === 0) {
      console.log("Keine Fahrer mit dem Seitenextraktor gefunden, versuche klassischen Extraktor");
      const legacyDriverKPIs = extractDriverKPIs(fullText);
      driverKPIs.push(...legacyDriverKPIs);
    }
    
    const totalDrivers = driverKPIs.length;
    console.log(`Extrahiert: ${totalDrivers} Fahrer mit textbasiertem Ansatz`);
    
    // Fahrer-Extraktion als erfolgreich betrachten, wenn mindestens 5 Fahrer gefunden wurden
    const driversSuccessful = totalDrivers >= 5;
    
    if (detailedLogging) {
      console.log(`Gefundene Fahrer-IDs: ${driverKPIs.slice(0, 5).map(d => d.name).join(', ')}${totalDrivers > 5 ? '...' : ''}`);
    }
    
    // Extrahiere andere Daten
    const companyKPIs = extractCompanyKPIs(companyText);
    const location = extractLocation(fullText);
    const overallScore = extractOverallScore(fullText);
    const overallStatus = extractOverallStatus(overallScore);
    const rank = extractRank(fullText);
    const year = new Date().getFullYear();
    
    // Convert weekNum to number if it's a string
    const weekNumber = typeof weekNum === 'string' ? parseInt(weekNum.replace(/\D/g, '')) : weekNum;
    
    // Stelle die Scorecard-Daten zusammen
    return { 
      success: driversSuccessful, 
      data: {
        week: weekNumber,
        year,
        location,
        overallScore,
        overallStatus,
        rank,
        rankNote: "",
        companyKPIs,
        categorizedKPIs: {
          safety: companyKPIs.filter(kpi => kpi.category === "safety"),
          compliance: companyKPIs.filter(kpi => kpi.category === "compliance"),
          customer: companyKPIs.filter(kpi => kpi.category === "customer"),
          standardWork: companyKPIs.filter(kpi => kpi.category === "standardWork"),
          quality: companyKPIs.filter(kpi => kpi.category === "quality"),
          capacity: companyKPIs.filter(kpi => kpi.category === "capacity")
        },
        driverKPIs,
        recommendedFocusAreas: companyKPIs
          .filter(kpi => kpi.status === "poor" || kpi.status === "fair")
          .slice(0, 3)
          .map(kpi => kpi.name),
        isSampleData: false
      }, 
      error: null 
    };
  } catch (error) {
    console.error("Fehler bei textbasierter Extraktion:", error);
    return { 
      success: false, 
      data: null, 
      error 
    };
  }
};

/**
 * Erstelle Fallback-Daten, wenn keine Extraktion erfolgreich war
 * @param weekNum Wochennummer aus dem Dateinamen
 * @returns Fallback-Scorecard-Daten
 */
export const createFallbackData = (weekNum: string | number): ScoreCardData => {
  console.log("Erstelle Fallback-Daten");
  
  // Parse die Wochennummer
  const weekNumber = typeof weekNum === 'string' ? parseInt(weekNum.replace(/\D/g, '')) : weekNum;
  
  return {
    week: weekNumber,
    year: new Date().getFullYear(),
    location: "DSP",
    overallScore: 75,
    overallStatus: "good",
    rank: 10,
    rankNote: "",
    companyKPIs: [],
    categorizedKPIs: {
      safety: [],
      compliance: [],
      customer: [],
      standardWork: [],
      quality: [],
      capacity: []
    },
    driverKPIs: [],
    recommendedFocusAreas: [],
    isSampleData: true
  };
};
