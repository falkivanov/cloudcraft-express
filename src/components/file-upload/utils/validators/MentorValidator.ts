
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
    
    // Mentor-specific validations could be added here
    // For example, checking file size, checking for specific content, etc.
    
    return {
      isValid: true,
      message: this.getSuccessMessage()
    };
  }
}
