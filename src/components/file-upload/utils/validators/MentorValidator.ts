
import { BaseValidator, ValidationResult } from "./BaseValidator";

/**
 * Validator for Mentor Excel files
 */
export class MentorValidator extends BaseValidator {
  public validate(): ValidationResult {
    // Check file extension
    if (!this.isExtensionValid(['.xlsx', '.xls'])) {
      return {
        isValid: false,
        message: this.getInvalidTypeMessage()
      };
    }
    
    // Validate file name format for Mentor reports (expected: Driver_Report_YYYY-MM-DD.xlsx)
    const fileNamePattern = /^(Driver.?Report|Mentor).?(20\d{2})[_\-]?(\d{2})[_\-]?(\d{2})/i;
    if (!fileNamePattern.test(this.file.name)) {
      return {
        isValid: false,
        message: "Der Dateiname entspricht nicht dem erwarteten Format für Mentor-Berichte. Erwartet: Driver_Report_YYYY-MM-DD.xlsx"
      };
    }
    
    // Check file size (reject files that are too large or too small)
    if (this.file.size > 10 * 1024 * 1024) { // 10 MB max
      return {
        isValid: false,
        message: "Die Datei ist zu groß. Die maximale Dateigröße beträgt 10 MB."
      };
    }
    
    if (this.file.size < 1000) { // Minimum size check
      return {
        isValid: false,
        message: "Die Datei ist zu klein und enthält wahrscheinlich keine gültigen Daten."
      };
    }
    
    return {
      isValid: true,
      message: this.getSuccessMessage()
    };
  }
  
  protected getSuccessMessage(): string {
    return `Mentor-Datei "${this.file.name}" ist gültig und bereit zum Hochladen.`;
  }
  
  protected getInvalidTypeMessage(): string {
    return `Ungültiger Dateityp für Mentor-Daten. Erlaubte Formate: .xlsx, .xls`;
  }
}
