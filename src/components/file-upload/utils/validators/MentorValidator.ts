
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
    
    // Erweiterte Validierung der Dateinamen für Mentor-Reports
    // Erlaubt verschiedene Formate wie "Driver_Report_YYYY-MM-DD.xlsx" oder "Mentor Report KW13 2023.xlsx"
    const datePattern = /(Driver.?Report|Mentor).?(20\d{2})[_\-]?(\d{2})[_\-]?(\d{2})/i;
    const kwPattern = /(Driver.?Report|Mentor).?(KW|CW).?(\d{1,2})/i;
    
    if (!datePattern.test(this.file.name) && !kwPattern.test(this.file.name)) {
      // Einfache Fallback-Prüfung für den Fall, dass die Muster nicht passen
      const basicPattern = /(Driver|Mentor|DSP)/i;
      if (!basicPattern.test(this.file.name)) {
        return {
          isValid: false,
          message: "Der Dateiname entspricht nicht dem erwarteten Format für Mentor-Berichte. Bitte verwenden Sie 'Driver_Report_YYYY-MM-DD.xlsx' oder 'Mentor Report KW13.xlsx'"
        };
      }
    }
    
    // Check file size (reject files that are too large or too small)
    if (this.file.size > 10 * 1024 * 1024) { // 10 MB max
      return {
        isValid: false,
        message: "Die Datei ist zu groß. Die maximale Dateigröße beträgt 10 MB."
      };
    }
    
    if (this.file.size < 100) { // Minimum size check
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
