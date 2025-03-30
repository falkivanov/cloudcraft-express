
import { toast } from "sonner";
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from "@/utils/storageUtils";

export interface ProcessOptions {
  showToasts?: boolean;
}

/**
 * Base class for all file processors
 */
export abstract class BaseFileProcessor {
  protected file: File;
  protected category: string;
  protected setProcessing: (processing: boolean) => void;
  protected onFileUpload?: (file: File, type: string, category: string) => void;
  
  constructor(
    file: File, 
    category: string, 
    setProcessing: (processing: boolean) => void,
    onFileUpload?: (file: File, type: string, category: string) => void
  ) {
    this.file = file;
    this.category = category;
    this.setProcessing = setProcessing;
    this.onFileUpload = onFileUpload;
  }
  
  /**
   * Main processing method to be implemented by all processors
   */
  public abstract process(options?: ProcessOptions): Promise<boolean>;
  
  /**
   * Default processing that happens for all file types
   */
  protected processDefault(showToasts: boolean = true): void {
    // Determine file type from name
    const fileType = this.file.name.split('.').pop()?.toLowerCase() || '';
    
    // Call the callback if it exists
    if (this.onFileUpload) {
      this.onFileUpload(this.file, fileType, this.category);
    }
    
    // Generic success message if none was shown by the specific processor
    if (showToasts) {
      toast.success(
        `Datei erfolgreich hochgeladen: ${this.file.name}`,
        {
          description: `Die Daten wurden verarbeitet und gespeichert.`,
        }
      );
    }
    
    // Add to upload history
    this.addToUploadHistory(this.file, fileType, this.category);
  }
  
  /**
   * Add file to upload history in localStorage
   * Changed from private to protected so subclasses can use it
   */
  protected addToUploadHistory(file: File, type: string, category: string, metadata?: any): void {
    try {
      const historyJSON = localStorage.getItem(STORAGE_KEYS.FILE_UPLOAD_HISTORY);
      const history = historyJSON ? JSON.parse(historyJSON) : [];
      
      const historyItem = {
        name: file.name,
        type: type,
        timestamp: new Date().toISOString(),
        category: category
      };

      // Add metadata if provided
      if (metadata) {
        Object.assign(historyItem, { metadata });
      }
      
      history.unshift(historyItem);
      
      // Keep only the latest 100 entries
      const trimmedHistory = history.slice(0, 100);
      saveToStorage(STORAGE_KEYS.FILE_UPLOAD_HISTORY, trimmedHistory);
    } catch (error) {
      console.error("Error adding to upload history:", error);
    }
  }
}
