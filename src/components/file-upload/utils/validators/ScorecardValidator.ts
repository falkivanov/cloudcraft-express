
import { BaseValidator, ValidationResult } from "./BaseValidator";

/**
 * Validator for Scorecard files (PDF format)
 */
export class ScorecardValidator extends BaseValidator {
  public validate(): ValidationResult {
    // Check file extension
    if (!this.isExtensionValid(['.pdf'])) {
      return {
        isValid: false,
        message: this.getInvalidTypeMessage()
      };
    }

    // Extract KW information from filename
    const weekMatch = this.file.name.match(/KW[_\s]*(\d+)/i);
    let successMessage = this.getSuccessMessage();
    
    if (weekMatch && weekMatch[1]) {
      const extractedWeek = parseInt(weekMatch[1], 10);
      console.log(`Detected KW ${extractedWeek} in filename`);
      successMessage = `Datei "${this.file.name}" ausgewählt (KW ${extractedWeek})`;
    }
    
    return {
      isValid: true,
      message: successMessage
    };
  }
}
