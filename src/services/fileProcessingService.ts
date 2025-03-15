
import * as pdfParse from 'pdf-parse';
import { createWorker } from 'tesseract.js';

// Definiert die Struktur einer verarbeiteten Datei
export interface ProcessedFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  content: string;
  processedAt: Date;
}

// Lokaler Speicherschlüssel für verarbeitete Dateien
const STORAGE_KEY = 'processed_files';

export class FileProcessingService {
  // Holt verarbeitete Dateien aus dem lokalen Speicher
  static getProcessedFiles(): ProcessedFile[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  // Speichert eine verarbeitete Datei im lokalen Speicher
  static saveProcessedFile(file: ProcessedFile): void {
    const files = FileProcessingService.getProcessedFiles();
    files.unshift(file); // Neueste zuerst hinzufügen
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  }

  // Verarbeitet eine Datei basierend auf ihrem Typ
  static async processFile(file: File, type: string): Promise<ProcessedFile> {
    let content = '';

    switch (type) {
      case 'pdf':
        content = await FileProcessingService.processPdf(file);
        break;
      case 'excel':
      case 'csv':
        content = await FileProcessingService.processTabularData(file);
        break;
      case 'html':
        content = await FileProcessingService.processHtml(file);
        break;
      default:
        content = await FileProcessingService.processGenericText(file);
    }

    return {
      id: crypto.randomUUID(),
      fileName: file.name,
      fileType: type,
      fileSize: file.size,
      content,
      processedAt: new Date(),
    };
  }

  // Verarbeitet PDF-Dateien und extrahiert Text
  private static async processPdf(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      
      try {
        // Versuche zuerst mit pdf-parse (für PDFs mit bereits eingebettetem Text)
        const data = await pdfParse(buffer);
        if (data.text && data.text.trim().length > 0) {
          return data.text;
        }
      } catch (e) {
        console.log('PDF-Parse-Fehler, versuche OCR:', e);
      }

      // Wenn pdf-parse keinen Text findet oder fehlschlägt, nutze OCR
      return await FileProcessingService.performOcr(file);
    } catch (error) {
      console.error('Fehler bei der PDF-Verarbeitung:', error);
      return `Fehler bei der Verarbeitung der PDF-Datei: ${error}`;
    }
  }

  // Führt OCR auf einer Datei aus
  private static async performOcr(file: File): Promise<string> {
    try {
      const worker = await createWorker('deu+eng'); // Unterstützung für Deutsch und Englisch
      
      const imageData = await FileProcessingService.fileToImageData(file);
      const result = await worker.recognize(imageData);
      await worker.terminate();
      
      return result.data.text || 'Kein Text mit OCR erkannt';
    } catch (error) {
      console.error('OCR-Fehler:', error);
      return `OCR-Verarbeitungsfehler: ${error}`;
    }
  }

  // Konvertiert eine Datei in ImageData für OCR
  private static async fileToImageData(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Verarbeitet tabellarische Daten (Excel, CSV)
  private static async processTabularData(file: File): Promise<string> {
    // Einfache Textextraktion für CSV-Dateien
    // Für Excel würde hier eine spezifischere Verarbeitung implementiert
    const text = await FileProcessingService.processGenericText(file);
    return text;
  }

  // Verarbeitet HTML-Dateien
  private static async processHtml(file: File): Promise<string> {
    const text = await FileProcessingService.processGenericText(file);
    
    // Einfache Entfernung von HTML-Tags
    const strippedText = text.replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
      
    return strippedText;
  }

  // Generische Textextraktion für einfache Dateitypen
  private static async processGenericText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}
