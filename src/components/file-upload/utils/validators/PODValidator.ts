
import { BaseValidator, ValidationResult } from "./BaseValidator";

/**
 * Validator for POD files (PDF format)
 */
export class PODValidator extends BaseValidator {
  public validate(): ValidationResult {
    // Check file extension
    if (!this.isExtensionValid(['.pdf'])) {
      return {
        isValid: false,
        message: this.getInvalidTypeMessage()
      };
    }
    
    // POD-specific validations could be added here
    // For example, checking file size, checking for specific content, etc.
    
    return {
      isValid: true,
      message: this.getSuccessMessage()
    };
  }
}
