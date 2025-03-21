
import { toast } from "sonner";
import { getCategoryInfo } from "../fileCategories";

export interface ProcessOptions {
  showToasts?: boolean;
}

/**
 * Base processor class with common functionality
 */
export abstract class BaseFileProcessor {
  protected file: File;
  protected category: string;
  protected onFileUpload?: (file: File, type: string, category: string) => void;
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
   * Process the file according to its category - to be implemented by subclasses
   */
  public abstract process(options: ProcessOptions): Promise<boolean>;
  
  /**
   * Default processing for file types that don't need special handling
   */
  protected processDefault(showToasts: boolean): void {
    const categoryInfo = getCategoryInfo(this.category);
    
    if (showToasts && categoryInfo) {
      toast.success(`Datei "${this.file.name}" erfolgreich als ${categoryInfo.name} hochgeladen`);
    }
    
    if (this.onFileUpload) {
      const fileType = categoryInfo?.expectedType || "unknown";
      this.onFileUpload(this.file, fileType, this.category);
    }
  }
}
