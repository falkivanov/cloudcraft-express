
import { BaseValidator, ValidationResult } from "./BaseValidator";

/**
 * Validator for Concessions files (Excel format)
 */
export class ConcessionsValidator extends BaseValidator {
  public validate(): ValidationResult {
    // Check file extension
    if (!this.isExtensionValid(['.xlsx', '.xls'])) {
      return {
        isValid: false,
        message: this.getInvalidTypeMessage()
      };
    }
    
    // Additional validations for concessions files could be added here
    // For example, checking file structure, specific sheets, etc.
    
    return {
      isValid: true,
      message: this.getSuccessMessage()
    };
  }
}
