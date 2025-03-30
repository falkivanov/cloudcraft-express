
import { toast } from "sonner";
import { getCategoryInfo } from "./fileCategories";
import { FileProcessorFactory } from "./processors/FileProcessorFactory";
import { ProcessOptions } from "./processors/BaseFileProcessor";

/**
 * Unified FileProcessor class that handles all file types
 */
export class FileProcessor {
  private file: File;
  private category: string;
  private onFileUpload?: (file: File, type: string, category: string) => void;
  private processing: boolean = false;
  
  constructor(
    file: File, 
    category: string, 
    onFileUpload?: (file: File, type: string, category: string) => void
  ) {
    this.file = file;
    this.category = category;
    this.onFileUpload = onFileUpload;
  }

  /**
   * Get the currently processing state
   */
  public isProcessing(): boolean {
    return this.processing;
  }

  /**
   * Set the processing state
   */
  public setProcessing(value: boolean): void {
    this.processing = value;
  }
  
  /**
   * Process the file according to its category
   */
  public async process(options: ProcessOptions = {}): Promise<boolean> {
    const { showToasts = true } = options;
    
    if (!this.file) {
      if (showToasts) toast.error("Bitte wählen Sie zuerst eine Datei aus");
      return false;
    }
    
    const categoryInfo = getCategoryInfo(this.category);
    if (!categoryInfo) {
      if (showToasts) toast.error("Ungültige Kategorie ausgewählt");
      return false;
    }
    
    this.processing = true;
    console.info(`Processing ${this.category} file: ${this.file.name}`);
    
    try {
      // Create the appropriate processor using the factory
      const processor = FileProcessorFactory.createProcessor(
        this.file,
        this.category,
        (value: boolean) => this.setProcessing(value),
        this.onFileUpload
      );
      
      // Process the file
      console.log(`Starting processing of ${this.category} file with processor`);
      await processor.process(options);
      console.info(`Successfully processed ${this.category} file: ${this.file.name}`);
      
      // Redirect to the appropriate page based on file category
      if (this.category === "scorecard" && showToasts) {
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
      
      return true;
    } catch (error) {
      console.error("Error processing file:", error);
      let errorMessage = 'Unbekannter Fehler';
      
      if (error instanceof Error) {
        errorMessage = `Fehler beim Verarbeiten der Datei: ${error.message}`;
      }
      
      if (showToasts) toast.error(errorMessage);
      return false;
    } finally {
      this.processing = false;
    }
  }
}

/**
 * Utility function to process a file using the FileProcessor
 * 
 * @param file The file to process
 * @param fileType The file type
 * @param category The file category
 * @param options Processing options
 * @returns A promise that resolves to a boolean indicating success
 */
export async function processFile(
  file: File,
  fileType: string,
  category: string,
  onFileUpload?: (file: File, type: string, category: string) => void,
  options: ProcessOptions = {}
): Promise<boolean> {
  console.log(`Processing file using utility function: ${file.name}, category: ${category}`);
  const processor = new FileProcessor(file, category, onFileUpload);
  return await processor.process(options);
}
