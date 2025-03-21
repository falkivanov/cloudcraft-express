
import { BaseValidator, ValidationResult } from "./BaseValidator";

/**
 * Validator for Customer Contact files (HTML format)
 */
export class CustomerContactValidator extends BaseValidator {
  public validate(): ValidationResult {
    // Check file extension
    if (!this.isExtensionValid(['.html', '.htm'])) {
      return {
        isValid: false,
        message: this.getInvalidTypeMessage()
      };
    }
    
    // Check if file contains expected customer contact data structure
    // This could be enhanced with content validation if needed
    
    return {
      isValid: true,
      message: this.getSuccessMessage()
    };
  }
}
