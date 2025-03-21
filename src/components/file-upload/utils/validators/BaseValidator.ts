
import { toast } from "sonner";
import { getCategoryInfo } from "../../fileCategories";

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

/**
 * Base validator class with common validation functionality
 */
export abstract class BaseValidator {
  protected file: File;
  protected categoryId: string;
  
  constructor(file: File, categoryId: string) {
    this.file = file;
    this.categoryId = categoryId;
  }
  
  /**
   * Validate file and return validation result
   */
  public abstract validate(): ValidationResult;
  
  /**
   * Get file extension from filename
   */
  protected getFileExtension(): string {
    return `.${this.file.name.split('.').pop()?.toLowerCase()}`;
  }
  
  /**
   * Check if file extension is in the allowed list
   */
  protected isExtensionValid(allowedExtensions: string[]): boolean {
    const extension = this.getFileExtension();
    return allowedExtensions.includes(extension);
  }
  
  /**
   * Get appropriate success message for selected file
   */
  protected getSuccessMessage(): string {
    return `Datei "${this.file.name}" ausgewählt`;
  }
  
  /**
   * Get error message for invalid file type
   */
  protected getInvalidTypeMessage(): string {
    const categoryInfo = getCategoryInfo(this.categoryId);
    return `Ungültiger Dateityp für ${categoryInfo?.name || this.categoryId}. Erwartet wird: ${categoryInfo?.expectedType.toUpperCase() || 'unbekannter Typ'}`;
  }
}
