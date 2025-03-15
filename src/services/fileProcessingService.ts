
import * as pdfParse from 'pdf-parse';
import { createWorker } from 'tesseract.js';
import { toast } from "sonner";

export interface ProcessedFile {
  fileName: string;
  fileType: string;
  fileSize: number;
  content: string;
  processedAt: Date;
}

export class FileProcessingService {
  // Verarbeitet Dateien basierend auf ihrem Typ
  static async processFile(file: File, type: string): Promise<ProcessedFile> {
    console.log(`Processing ${type} file: ${file.name}`);
    let content = '';

    try {
      switch (type) {
        case 'pdf':
          content = await this.processPdf(file);
          break;
        case 'excel':
          content = await this.processExcel(file);
          break;
        case 'csv':
          content = await this.processCsv(file);
          break;
        case 'html':
          content = await this.processHtml(file);
          break;
        default:
          content = 'Unsupported file type';
      }

      return {
        fileName: file.name,
        fileType: type,
        fileSize: file.size,
        content,
        processedAt: new Date(),
      };
    } catch (error) {
      console.error(`Error processing ${type} file:`, error);
      toast.error(`Fehler bei der Verarbeitung der Datei: ${file.name}`);
      throw error;
    }
  }

  // Verarbeitet PDF-Dateien mit OCR wenn nötig
  private static async processPdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    try {
      // PDF-Parse für text-basierte PDFs
      const pdfData = await pdfParse(buffer);
      
      // Wenn Text erkannt wurde, diesen zurückgeben
      if (pdfData.text && pdfData.text.trim().length > 0) {
        return pdfData.text;
      }
      
      // Wenn kein Text erkannt wurde, OCR verwenden
      return await this.performOcr(file);
    } catch (error) {
      console.error('Error parsing PDF, trying OCR:', error);
      return await this.performOcr(file);
    }
  }

  // Führt OCR auf einer Datei aus
  private static async performOcr(file: File): Promise<string> {
    toast.info("OCR wird gestartet. Das kann einen Moment dauern...");
    
    const worker = await createWorker('deu+eng');
    
    try {
      const image = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Konnte keinen Canvas-Kontext erstellen');
      }
      
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      
      const { data } = await worker.recognize(canvas);
      await worker.terminate();
      
      return data.text;
    } catch (error) {
      console.error('OCR-Fehler:', error);
      await worker.terminate();
      throw new Error('OCR konnte nicht durchgeführt werden');
    }
  }

  // Verarbeitet Excel-Dateien - Platzhalter für zukünftige Implementierung
  private static async processExcel(file: File): Promise<string> {
    // Für echte Implementierung würden wir eine Excel-Bibliothek wie xlsx verwenden
    return 'Excel-Verarbeitung noch nicht implementiert';
  }

  // Verarbeitet CSV-Dateien
  private static async processCsv(file: File): Promise<string> {
    const text = await file.text();
    return text;
  }

  // Verarbeitet HTML-Dateien
  private static async processHtml(file: File): Promise<string> {
    const text = await file.text();
    return text;
  }

  // Speichert verarbeitete Dateien im localStorage
  static saveProcessedFile(processedFile: ProcessedFile): void {
    const storedFiles = this.getProcessedFiles();
    storedFiles.push(processedFile);
    localStorage.setItem('processedFiles', JSON.stringify(storedFiles));
  }

  // Holt alle verarbeiteten Dateien aus dem localStorage
  static getProcessedFiles(): ProcessedFile[] {
    const storedFiles = localStorage.getItem('processedFiles');
    return storedFiles ? JSON.parse(storedFiles) : [];
  }
}
